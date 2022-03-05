import { supabase } from '$lib/supabaseclient';
import type { ApiError, PostgrestError, RealtimeSubscription, User } from '@supabase/supabase-js';
import type { definitions } from '$lib/models';
import { writable } from 'svelte/store';
import dayjs from 'dayjs';

export const family = writable<definitions['families'] | null>(null);
export const lunches = writable<definitions['lunchs'][] | []>([]);
export const familyUsers = writable<definitions['users_to_families'][] | []>([]);
export const lunchMembers = writable<definitions['lunch_members'][] | []>([]);

let unserName: string | null = null;
let familyID: string | null = null;
let lunchSubscription: RealtimeSubscription;
let lunchMemberSubscription: RealtimeSubscription;
let userSubscription: RealtimeSubscription;

let familyUsersLocal: definitions['users_to_families'][] = [];
export let lunchsLocal: definitions['lunchs'][] = [];

const familySubscription = family.subscribe(async (family) => {
	/**
	 * Family exists, start subscribing to all updates
	 */
	if (family) {
		familyID = family.id;
		await initalFetchLunchMembers();
		await subscribeLunchMemers();
		await initalFetchUsers();
		await subscribeUsers();
		await initalFetchLunches();
		await subscribeLunch();
	}
});

const userLocalSubscription = familyUsers.subscribe(async (users) => {
	//update needed to update lunches
	lunches.update((l) => l);
	familyUsersLocal = users;
});

const localLunchSubscription = lunches.subscribe(async (lunches) => {
	lunchsLocal = lunches;
});

export const getUserByID = (id: string) => {
	const user = familyUsersLocal.find((user) => user.user_id === id);
	return user;
};

export const setCookForLunch = async (lunch: definitions['lunchs']) => {
	lunch.cook_id = getUser().id;
	await supabase.from<definitions['lunchs']>('lunchs').update(lunch).eq('id', lunch.id);
};

export const removeCookForLunch = async (lunch: definitions['lunchs']) => {
	lunch.cook_id = null;
	await supabase.from<definitions['lunchs']>('lunchs').update(lunch).eq('id', lunch.id);
};
const subscribeLunch = async () => {
	lunchSubscription = await supabase
		.from<definitions['lunchs']>('lunchs')
		.on('INSERT', (lunch) => {
			//TODO: add to RLS
			if (lunch.new.family_id == familyID) {
				lunches.update((l) => [lunch.new, ...l].sort((a, b) => a.created_at - b.created_at));
			}
		})
		.on('UPDATE', (newLunch) => {
			lunches.update((l) => {
				const index = l.findIndex((lunch) => lunch.id === newLunch.new.id);
				if (index !== -1) {
					l[index] = newLunch.new;
				}
				return l;
			});
		})
		.subscribe();
};
lunchSubscription.onClose(() => {
	alert('lunchSubscription closed');
});
lunchSubscription.onError(() => {
	alert('lunchSubscription error');
});

export const createVote = async (lunchProposalId, lunchId, voteType: boolean) => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal_vote']>('lunch_proposal_vote')
		.insert({
			lunch_proposal_id: lunchProposalId,
			upvote: voteType,
			lunch_id: lunchId,
			family_id: familyID,
			user_id: getUser().id
		});
	if (error) {
		throw error;
	}
};

export const deleteVote = async (lunchProposalId, lunchId) => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal_vote']>('lunch_proposal_vote')
		.delete()
		.match({
			user_id: getUser().id,
			lunch_id: lunchId,
			lunch_proposal_id: lunchProposalId,
			family_id: familyID
		});

	if (error) {
		throw error;
	}
};

const subscribeLunchMemers = async () => {
	lunchMemberSubscription = await supabase
		.from<definitions['lunch_members']>('lunch_members')
		.on('INSERT', (lunchMember) => {
			if (lunchMember.new.family_id == familyID) {
				lunchMembers.update((l) => [lunchMember.new, ...l]);
			}
		})
		.on('UPDATE', (newLunch) => {
			if (newLunch.new.family_id == familyID) {
				lunchMembers.update((l) => {
					const index = l.findIndex((lunchMember) => lunchMember.id === newLunch.new.id);
					if (index !== -1) {
						l[index] = newLunch.new;
					}
					return l;
				});
			}
		})
		.on('DELETE', (deleted) => {
			lunchMembers.update((l) => l.filter((lunchMember) => lunchMember.id !== deleted.old.id));
		})
		.subscribe();
};

const subscribeUsers = async () => {
	userSubscription = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.on('INSERT', (user) => {
			//TODO: add to RLS
			if (user.new.families_id == familyID) {
				familyUsers.update((usr) => [user.new, ...usr]);
			}
		})
		.subscribe();
};

const destory = () => {
	lunchSubscription.unsubscribe();
	userSubscription.unsubscribe();
	lunchMemberSubscription.unsubscribe();
};

export const initalFetchLunches = async () => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.select('*')
		.order('created_at', { ascending: false })
		.eq('family_id', familyID)
		.limit(7);
	// const lunchesCreatedToday = data.filter((lunch) => IsDateToday(lunch.created_at));
	lunches.set(data.reverse());
};

export const initalFetchUsers = async () => {
	const { data, error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.select('*')
		.eq('families_id', familyID);
	familyUsers.set(data);
	const userNames = data.filter((user) => user.user_id === getUser().id)?.map((user) => user.name);
	unserName = userNames?.[0];
};

export const initalFetchLunchProposals = async (
	lunchId: string
): Promise<definitions['lunch_proposal'][]> => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal']>('lunch_proposal')
		.select('*')
		.eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data;
};

export const initalFetchLunchComments = async (
	lunchId: string
): Promise<definitions['lunch_proposal_comments'][]> => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal_comments']>('lunch_proposal_comments')
		.select('*')
		.eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data.sort((a, b) => a.created_at - b.created_at).reverse();
};

export const initalFetchLunchVotes = async (
	lunchId: string
): Promise<definitions['lunch_proposal_vote'][]> => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal_vote']>('lunch_proposal_vote')
		.select('*')
		.eq('lunch_id', lunchId);
	if (error) {
		throw error;
	}
	return data;
};

export const initalFetchLunchMembers = async () => {
	const { data, error } = await supabase
		.from<definitions['lunch_members']>('lunch_members')
		.select('*')
		.eq('family_id', familyID);
	lunchMembers.set(data);
};
export const createLunch = async (): Promise<PostgrestError | Error | null> => {
	await initalFetchLunches();
	//curently only one lunch can be created per family per day
	if (lunchsLocal.length > 0) {
		return;
	}
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.insert({ family_id: familyID, created_by: getUser().id });
	if (error) {
		return error;
	}
};

export const createMeal = async (lunchId: string, name: string): Promise<definitions['meals']> => {
	const { data, error } = await supabase
		.from<definitions['meals']>('meals')
		.insert({
			lunch_id: lunchId,
			name: name,
			family_id: familyID,
			created_by: getUser().id
		})
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
	console.log(newId);
	const { data, error } = await supabase
		.from<definitions['lunch_proposal']>('lunch_proposal')
		.insert({
			lunch_id: lunchId,
			user_id: getUser().id,
			meal_type: newId,
			family_id: familyID
		});
	if (error) {
		return error;
	}
};

export const fetchMeals = async (): Promise<definitions['meals'][]> => {
	const { data, error } = await supabase
		.from<definitions['meals']>('meals')
		.select('*')
		.eq('family_id', familyID);
	if (error) {
		return [];
	}
	return data;
};

export const joinLunch = async (
	lunch: definitions['lunchs'],
	startTime?: string,
	endTime?: string
): Promise<PostgrestError | Error | null> => {
	// ALTER TABLE table ADD UNIQUE (book_id, author_id)
	const { data, error } = await supabase
		.from<definitions['lunch_members']>('lunch_members')
		.insert({
			family_id: familyID,
			user_id: getUser().id,
			lunch_id: lunch.id,
			username: unserName,
			StartTime: startTime,
			EndTime: endTime
		});
	if (error) {
		console.log(error);
		return error;
	}
};

export const leaveLunch = async (
	lunch: definitions['lunchs']
): Promise<PostgrestError | Error | null> => {
	// ALTER TABLE table ADD UNIQUE (book_id, author_id)
	const { data, error } = await supabase
		.from<definitions['lunch_members']>('lunch_members')
		.delete()
		.match({
			family_id: familyID,
			user_id: getUser().id,
			lunch_id: lunch.id
		});

	if (error) {
		console.log(error);
		return error;
	}
};
export const signIn = async (email, password) => {
	const { user: userDetails, error } = await supabase.auth.signIn({
		email: email,
		password: password
	});
	return [userDetails, error];
};

export const signUp = async (email, password): Promise<[User, ApiError]> => {
	const { user: userDetails, error } = await supabase.auth.signUp({
		email: email,
		password: password
	});
	return [userDetails, error];
};

export const signOut = async (): Promise<ApiError> => {
	const { error } = await supabase.auth.signOut();
	console.log('After logut', await supabase.auth.user());
	return error;
};

export const setLunchProposalForVote = async (lunchId: string, lunchProposalId: string) => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.update({ selected_lunch_proposal_id: lunchProposalId })
		.eq('id', lunchId);
};

export const removeLunchProposalForVote = async (lunchId: string) => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.update({ selected_lunch_proposal_id: null })
		.eq('id', lunchId);
};

export const deleteLunchProposal = async (lunchProposalId: string) => {
	const deleteVotes = await supabase
		.from<definitions['lunch_proposal_vote']>('lunch_proposal_vote')
		.delete()
		.eq('lunch_proposal_id', lunchProposalId);
	const { data, error } = await supabase
		.from<definitions['lunch_proposal']>('lunch_proposal')
		.delete()
		.eq('id', lunchProposalId);
};

export const createCommentForLunch = async (lunchId: string, comment: string) => {
	const { data, error } = await supabase
		.from<definitions['lunch_proposal_comments']>('lunch_proposal_comments')
		.insert({ family_id: familyID, lunch_id: lunchId, user_id: getUser().id, text: comment });
};
/**
 * Check if user belongs to a family and starts subscribing to updates
 * @returns family exists or not
 */
export const mountFamily = async (): Promise<boolean> => {
	const { data, error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.select('*')
		.eq('user_id', getUser().id);

	if (error || !data[0] || !data[0].families_id) {
		return false;
	}
	const familyObject = await getFamily(data[0].families_id);
	if (familyObject || familyObject.id) {
		family.set(familyObject);
	}
	return true;
};

export const getUserName = async (): Promise<string | undefined> => {
	const { data, error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.select('*')
		.eq('user_id', getUser().id);

	if (error || !data[0] || !data[0].name) {
		return undefined;
	}
	return data[0].name;
};

export const setUsername = async (
	username: string
): Promise<PostgrestError | Error | undefined> => {
	const { data, error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.upsert([{ user_id: getUser().id, name: username }]);
	return error;
};

export const getFamily = async (family_id): Promise<definitions['families']> => {
	const { data, error } = await supabase
		.from<definitions['families']>('families')
		.select('*')
		.eq('id', family_id)
		.single();
	return data;
};

export const createFamily = async (familyName): Promise<PostgrestError | Error | null> => {
	const { data: alreadyExists, error: userExistsError } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.select('families_id')
		.eq('user_id', getUser().id);
	if (alreadyExists[0] && alreadyExists[0].families_id) {
		return new Error("You're already in a family");
	}
	if (userExistsError) {
		return userExistsError;
	}
	const { data: families, error } = await supabase
		.from<definitions['families']>('families')
		.insert({ name: familyName, creator_id: getUser().id });

	if (error) {
		return error;
	}

	const { error: userToFamilies } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.upsert({ families_id: families[0].id, user_id: getUser().id });
	if (userToFamilies) {
		return userToFamilies;
	}
	family.set(families[0]);
};

export const joinFamily = async (familyId: string): Promise<PostgrestError | Error | null> => {
	const { error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.upsert([{ user_id: getUser().id, families_id: familyId }]);
	return error;
};

export function getUser() {
	return supabase.auth.user();
}
export async function getUserAsync() {
	return await supabase.auth.user();
}

export const createLunchesForWeek = async () => {
	// get the next 7 days
	const today = dayjs.utc();
	const next7days = [today];
	for (let i = 1; i < 7; i++) {
		next7days.push(dayjs.utc().add(i, 'day'));
	}
	const toCreate = [];
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
	const lunchsForWeek = [];

	for (const date of toCreate) {
		const lunch = {
			created_at: date.toISOString(),
			lunch_date: date.toISOString(),
			created_by: getUser().id,
			family_id: familyID
		};
		lunchsForWeek.push(lunch);
	}
	await supabase.from<definitions['lunchs']>('lunchs').insert(lunchsForWeek);
};

export const getFamilyID = () => {
	return familyID;
};
