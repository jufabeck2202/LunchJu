import { supabase } from '$lib/supabaseclient';
import type { Database } from '$lib/DatabaseDefinitions';
import type { AuthError, PostgrestError, User, RealtimeChannel } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import dayjs from 'dayjs';
export const family = writable<Database['public']['Tables']['families']['Row'] | null>(null);
export const lunches = writable<Database['public']['Tables']['lunchs']['Row'][] | []>([]);

export const familyUsers = writable<
	Database['public']['Tables']['users_to_families']['Row'][] | []
>([]);
export const lunchMembers = writable<Database['public']['Tables']['lunch_members']['Row'][] | []>(
	[]
);

let userName: string | undefined = undefined;
let localFamilyId: string | null = null;
let localUserId: string | undefined = undefined;
let lunchSubscription: RealtimeChannel;
let lunchMemberSubscription: RealtimeChannel;
let userSubscription: RealtimeChannel;

const familyUsersLocal: Database['public']['Tables']['users_to_families']['Row'][] = [];
const lunchsLocal: Database['public']['Tables']['lunchs']['Row'][] = [];

export const getUserAsync = async () => {
	if (localUserId) {
		return localUserId;
	}
	const user = await supabase.auth.getUser();
	if (user.data.user) {
		localUserId = user.data.user.id;
		return localUserId;
	}
};
export const resetUser = () => {
	localUserId = undefined;
};
//returns familyId and fetches family if not already fetched
export const getFamilyId = async () => {
	if (localFamilyId) {
		return localFamilyId;
	}
	localFamilyId = await fetchFamilyIdForUser();
	if (!localFamilyId) {
		throw new Error('No family found');
	}
	return localFamilyId;
};

export const familySubscription = family.subscribe(async (family) => {
	console.log('Subscribing to family', family);
	/**
	 * Family exists, start subscribing to all updates
	 */
	if (family) {
		await initalFetchLunchMembers();
		await subscribeLunchMemers();
		await initalFetchUsers();
		await subscribeUsers();
		await initalFetchLunches();
		await subscribeLunch();
		await subscribePresence();
	}
});
const subscribePresence = async () => {
	const userId = await getUserAsync();
	const presence = supabase
		.channel('online-users')
		.on('presence', { event: 'sync' }, () => {
			console.log('currently online users', presence.presenceState());
		})
		.on('presence', { event: 'join' }, ({ newUser }) => {
			console.log('a new user has joined', newUser);
		})
		.on('presence', { event: 'leave' }, ({ leftUser }) => console.log('a user has left', leftUser))
		.subscribe(async (status) => {
			if (status === 'SUBSCRIBED') {
				const status = await presence.track({ user_name: userId });
			}
		});
};

export const getUserByID = (id: string) => {
	const user = familyUsersLocal.find((user) => user.user_id === id);
	return user;
};

export const setCookForLunch = async (lunch: Database['public']['Tables']['lunchs']['Row']) => {
	const userId = await getUserAsync();
	if (!userId) {
		return;
	}
	lunch.cook_id = userId;
	await supabase.from('lunchs').update(lunch).eq('id', lunch.id);
};

export const removeCookForLunch = async (lunch: Database['public']['Tables']['lunchs']['Row']) => {
	lunch.cook_id = null;
	await supabase.from('lunchs').update(lunch).eq('id', lunch.id);
};

export const createVote = async (lunchProposalId: string, lunchId: string, voteType: boolean) => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('User not logged in');
	}
	const { error } = await supabase.from('lunch_proposal_vote').insert({
		lunch_proposal_id: lunchProposalId,
		upvote: voteType,
		lunch_id: lunchId,
		family_id: await getFamilyId(),
		user_id: userId
	});
	if (error) {
		throw error;
	}
};

export const deleteVote = async (lunchProposalId: string, lunchId: string) => {
	const userId = await getUserAsync();
	const { error } = await supabase
		.from('lunch_proposal_vote')
		.delete()
		.match({
			user_id: userId,
			lunch_id: lunchId,
			lunch_proposal_id: lunchProposalId,
			family_id: await getFamilyId()
		});

	if (error) {
		throw error;
	}
};
export const resubscibe = async () => {
	await subscribeLunch();
	await subscribeUsers();
	await subscribeLunchMemers();
};

const subscribeLunchMemers = async () => {
	lunchMemberSubscription = supabase
		.channel('public:lunch_members')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'lunch_members' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async (lunchMember: any) => {
				if (lunchMember.new.family_id == (await getFamilyId())) {
					lunchMembers.update((l) =>
						l.some((member) => member.id === lunchMember.new.id) ? l : [lunchMember.new, ...l]
					);
				}
			}
		)
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'lunch_members' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async (newLunch: any) => {
				if (newLunch.new.family_id == (await getFamilyId())) {
					lunchMembers.update((l) => {
						const index = l.findIndex((lunchMember) => lunchMember.id === newLunch.new.id);
						if (index !== -1) {
							l[index] = newLunch.new;
						}
						return l;
					});
				}
			}
		)
		.on(
			'postgres_changes',
			{ event: 'DELETE', schema: 'public', table: 'lunch_members' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(deleted: any) => {
				lunchMembers.update((l) => l.filter((lunchMember) => lunchMember.id !== deleted.old.id));
			}
		)
		.subscribe();
};

const subscribeUsers = async () => {
	userSubscription = await supabase
		.channel('postgresChangesChannel')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'users_to_families' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async (user: any) => {
				//TODO: add to RLS
				if (user.new.families_id == (await getFamilyId())) {
					familyUsers.update((usr) =>
						usr.some((us) => us.user_id === user.new.user_id) ? usr : [user.new, ...usr]
					);
				}
			}
		)
		.subscribe();
};
const subscribeLunch = async () => {
	lunchSubscription = supabase
		.channel('public:lunchs')
		.on(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'lunchs' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async (lunch: any) => {
				if (lunch.new.family_id == (await getFamilyId())) {
					lunches.update((l) =>
						l.some((ll) => ll.id === lunch.new.id)
							? l.sort((a, b) => Number(a.created_at) - Number(b.created_at))
							: [lunch.new, ...l].sort((a, b) => a.created_at - b.created_at)
					);
				}
			}
		)
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'lunchs' },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(newLunch: any) => {
				console.log('lunch', newLunch);
				lunches.update((l) => {
					const index = l.findIndex((lunch) => lunch.id === newLunch.new.id);
					if (index !== -1) {
						l[index] = newLunch.new;
					}
					return l;
				});
			}
		)
		.subscribe();
};
const destory = () => {
	lunchSubscription.unsubscribe();
	userSubscription.unsubscribe();
	lunchMemberSubscription.unsubscribe();
};

export const initalFetchLunches = async () => {
	const { data, error } = await supabase
		.from('lunchs')
		.select('*')
		.order('created_at', { ascending: false })
		.eq('family_id', await getFamilyId())
		.limit(7);
	if (!data) {
		throw error;
	}
	lunches.set(data.reverse());
};

export const initalFetchUsers = async () => {
	const { data, error } = await supabase
		.from('users_to_families')
		.select('*')
		.eq('families_id', await getFamilyId());
	if (!data) {
		throw error;
	}
	familyUsers.set(data);
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const userNames = data.filter((user) => user.user_id === userId)?.map((user) => user.name);
	if (!userNames || !userNames[0]) {
		throw new Error('No user names');
	}
	userName = userNames[0];
	return error;
};

export const initalFetchLunchProposals = async (
	lunchId: string
): Promise<Database['public']['Tables']['lunch_proposal']['Row'][]> => {
	const { data, error } = await supabase.from('lunch_proposal').select('*').eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data;
};

export const initalFetchLunchComments = async (
	lunchId: string
): Promise<Database['public']['Tables']['lunch_proposal_comments']['Row'][]> => {
	const { data, error } = await supabase
		.from('lunch_proposal_comments')
		.select('*')
		.eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data.sort((a, b) => Number(a.created_at) - Number(b.created_at)).reverse();
};

export const initalFetchLunchVotes = async (
	lunchId: string
): Promise<Database['public']['Tables']['lunch_proposal_vote']['Row'][]> => {
	const { data, error } = await supabase
		.from('lunch_proposal_vote')
		.select('*')
		.eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data;
};

export const initalFetchLunchMembers = async () => {
	const { data, error } = await supabase
		.from('lunch_members')
		.select('*')
		.eq('family_id', await getFamilyId())
		.select();
	if (error) {
		throw error;
	}
	lunchMembers.set(data);
};
export const createLunch = async (): Promise<PostgrestError | Error | null> => {
	await initalFetchLunches();
	//curently only one lunch can be created per family per day
	if (lunchsLocal.length > 0) {
		return new Error('Only one lunch can be created per family per day');
	}
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { error } = await supabase.from('lunchs').insert({
		family_id: await getFamilyId(),
		created_by: userId
	} as Database['public']['Tables']['lunchs']['Row']);
	if (error) {
		return error;
	}
	return null;
};

export const createMeal = async (
	lunchId: string,
	name: string
): Promise<Database['public']['Tables']['meals']['Row']> => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { data, error } = await supabase
		.from('meals')
		.insert({
			lunch_id: lunchId,
			name: name,
			family_id: await getFamilyId(),
			created_by: userId
		})
		.select()
		.single();
	if (error) {
		throw error;
	}
	return data;
};

export const createLunchProposal = async (
	lunchId: string,
	lunchName: string,
	mealId: string | null = null
): Promise<PostgrestError | Error | null> => {
	const newId = mealId || (await createMeal(lunchId, lunchName)).id;
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { error } = await supabase.from('lunch_proposal').insert({
		lunch_id: lunchId,
		user_id: userId,
		meal_type: newId,
		family_id: await getFamilyId()
	});
	if (error) {
		return error;
	}
	return null;
};

export const fetchMeals = async (): Promise<Database['public']['Tables']['meals']['Row'][]> => {
	const { data, error } = await supabase
		.from('meals')
		.select('*')
		.eq('family_id', await getFamilyId());
	if (error) {
		return [];
	}
	return data;
};

export const joinLunch = async (
	lunch: Database['public']['Tables']['lunchs']['Row'],
	startTime?: string,
	endTime?: string
): Promise<PostgrestError | Error | null> => {
	// ALTER TABLE table ADD UNIQUE (book_id, author_id)
	const { error } = await supabase.from('lunch_members').insert({
		family_id: await getFamilyId(),
		user_id: await getUserAsync(),
		lunch_id: lunch.id,
		username: userName,
		StartTime: startTime,
		EndTime: endTime
	});
	if (error) {
		return error;
	}
	return null;
};

export const editLunchTime = async (
	lunch: Database['public']['Tables']['lunchs']['Row'],
	startTime?: string,
	endTime?: string
): Promise<PostgrestError | Error | null> => {
	const { error } = await supabase
		.from('lunch_members')
		.update({
			StartTime: startTime,
			EndTime: endTime
		})
		.eq('lunch_id', lunch.id)
		.eq('user_id', await getUserAsync());
	if (error) {
		return error;
	}
	return null;
};

export const leaveLunch = async (
	lunch: Database['public']['Tables']['lunchs']['Row']
): Promise<PostgrestError | Error | null> => {
	const { error } = await supabase
		.from('lunch_members')
		.delete()
		.match({
			family_id: await getFamilyId(),
			user_id: await getUserAsync(),
			lunch_id: lunch.id
		});

	if (error) {
		console.log(error);
		return error;
	}
	return null;
};
export const signIn = async (email: string, password: string) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password
	});
	return [data.user, error];
};

export const signUp = async (
	email: string,
	password: string
): Promise<[User | null, AuthError | null]> => {
	const { data, error } = await supabase.auth.signUp({
		email: email,
		password: password
	});

	return [data.user, error];
};

export const signOut = async (): Promise<AuthError | null> => {
	const { error } = await supabase.auth.signOut();
	console.log('After logut', await supabase.auth.getUser());
	return error;
};

export const setLunchProposalForVote = async (lunchId: string, lunchProposalId: string) => {
	const { error } = await supabase
		.from('lunchs')
		.update({ selected_lunch_proposal_id: lunchProposalId })
		.eq('id', lunchId);
	return error;
};

export const removeLunchProposalForVote = async (lunchId: string) => {
	const { error } = await supabase
		.from('lunchs')
		.update({ selected_lunch_proposal_id: null })
		.eq('id', lunchId);
	return error;
};

export const deleteLunchProposal = async (lunchProposalId: string) => {
	const { error } = await supabase
		.from('lunch_proposal_vote')
		.delete()
		.eq('lunch_proposal_id', lunchProposalId);
	if (error) {
		return error;
	}
	const { error: proposalError } = await supabase
		.from('lunch_proposal')
		.delete()
		.eq('id', lunchProposalId);
	return proposalError;
};

export const createCommentForLunch = async (lunchId: string, comment: string) => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { error } = await supabase.from('lunch_proposal_comments').insert({
		family_id: await getFamilyId(),
		lunch_id: lunchId,
		user_id: userId,
		text: comment
	});
	return error;
};

/**
 * Check if user belongs to a family and starts subscribing to updates
 * @returns family exists or not
 */
export const mountFamily = async (): Promise<boolean> => {
	let familyId = localFamilyId;
	if (!familyId) {
		familyId = await fetchFamilyIdForUser();
	}
	if (!familyId) {
		return false;
	}
	const familyObject = await getFamily(familyId);
	if (familyObject || familyObject) {
		family.set(familyObject);
	}
	return true;
};


const fetchFamilyIdForUser = async (): Promise<string | null> => {
	const { data, error } = await supabase
		.from('users_to_families')
		.select('*')
		.eq('user_id', await getUserAsync())
		.single();
	if (error) {
		return null;
	}
	return data.families_id;
};

export const getUserName = async (): Promise<string | undefined> => {
	const { data, error } = await supabase
		.from('users_to_families')
		.select('*')
		.eq('user_id', await getUserAsync());

	if (error || !data[0] || !data[0].name) {
		return undefined;
	}
	return data[0].name;
};

export const setUsername = async (
	username: string
): Promise<PostgrestError | Error | undefined> => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { error } = await supabase
		.from('users_to_families')
		.upsert([{ user_id: userId, name: username }]);
	return error;
};

export const getFamily = async (
	family_id: string
): Promise<Database['public']['Tables']['families']['Row']> => {
	const { data, error } = await supabase.from('families').select('*').eq('id', family_id).single();
	if (error) {
		throw error;
	}
	return data;
};

export const createFamily = async (familyName: string): Promise<PostgrestError | Error | null> => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { data: alreadyExists, error: userExistsError } = await supabase
		.from('users_to_families')
		.select('families_id')
		.eq('user_id', userId);
	if (alreadyExists && alreadyExists[0] && alreadyExists[0].families_id) {
		return new Error("You're already in a family");
	}
	if (userExistsError) {
		return userExistsError;
	}
	const { data: families, error } = await supabase
		.from('families')
		.insert({ name: familyName, creator_id: userId })
		.select();

	if (error) {
		return error;
	}
	const { error: userToFamilies } = await supabase
		.from('users_to_families')
		.upsert({ families_id: families[0].id, user_id: userId });
	if (userToFamilies) {
		return userToFamilies;
	}
	family.set(families[0]);
	return null;
};

export const joinFamily = async (familyId: string): Promise<PostgrestError | Error | undefined> => {
	const userId = await getUserAsync();
	if (!userId) {
		throw new Error('No user ID');
	}
	const { error } = await supabase
		.from('users_to_families')
		.upsert([{ user_id: userId, families_id: familyId }]);
	return error;
};

export const createLunchesForWeek = async () => {
	// get the next 7 days
	const today = dayjs.utc();
	const next7days = [today];
	// adds the next 7 days to the array
	for (let i = 1; i < 7; i++) {
		next7days.push(dayjs.utc().add(i, 'day'));
	}
	const toCreate: dayjs.Dayjs[] = [];
	next7days.forEach((day) => {
		let containtsDay = false;
		for (const lunch of lunchsLocal) {
			if (dayjs.utc(lunch.created_at).local().isSame(day, 'day')) {
				containtsDay = true;
			}
		}
		if (!containtsDay) {
			toCreate.push(day);
		}
	});
	console.log('toCreate', toCreate);
	const lunchsForWeek: Database['public']['Tables']['lunchs']['Insert'][] = [];

	for (const date of toCreate) {
		const lunch = {
			created_at: date.toISOString(),
			lunch_date: date.toISOString(),
			created_by: await getUserAsync(),
			family_id: await getFamilyId()
		} as Database['public']['Tables']['lunchs']['Insert'];
		lunchsForWeek.push(lunch);
	}
	console.log('lunchsForWeek', lunchsForWeek);
	for (const lunch of lunchsForWeek) {
		const { error } = await supabase.from('lunchs').insert(lunch);
		if (error) {
			console.log('error', error);
		}
	}
};
