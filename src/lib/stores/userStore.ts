import { supabase } from '$lib/supabaseclient';
import type { ApiError, PostgrestError, RealtimeSubscription, User } from '@supabase/supabase-js';
import type { definitions } from '$lib/models';
import { user } from '$lib/userWritableStore';
import { writable } from 'svelte/store';
import { IsDateToday } from '$lib/helpers/time';

export const family = writable<definitions['families'] | null>(null);
export const lunches = writable<definitions['lunchs'][] | []>([]);
export const familyUsers = writable<definitions['users_to_families'][] | []>([]);

export function getUser() {
	return supabase.auth.user();
}
let familyID: string | null = null;
let lunchSubscription: RealtimeSubscription;
let userSubscription: RealtimeSubscription;
const familySubscription = family.subscribe(async (family) => {
	if (family) {
		familyID = family.id;
		await initalFetchLunches(family.id);
		await subscribeLunch();
		await initalFetchUsers();
		await subscribeUsers();
	}
});

const subscribeLunch = async () => {
	lunchSubscription = await supabase
		.from<definitions['lunchs']>('lunchs')
		.on('INSERT', (lunch) => {
			//TODO: add to RLS
			if (lunch.new.family_id == familyID) {
				lunches.update((l) => [lunch.new, ...l]);
			}
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
};

export const initalFetchLunches = async (family_id) => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.select('*')
		.order('created_at', { ascending: false })
		.eq('family_id', family_id)
		.limit(3);
	const lunchesCreatedToday = data.filter((lunch) => IsDateToday(lunch.created_at));
	lunches.set(lunchesCreatedToday);
};

export const initalFetchUsers = async () => {
	const { data, error } = await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.select('*')
		.eq('families_id', familyID);
	familyUsers.set(data);
};

export const createLunch = async (): Promise<PostgrestError | Error | null> => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.insert({ family_id: familyID, created_by: getUser().id });
	if (error) {
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

export const checkIfUserFamilyExists = async (): Promise<boolean> => {
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
		.select('*')
		.eq('user_id', getUser().id);

	if (alreadyExists && alreadyExists.length > 0) {
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
		.insert({ families_id: families[0].id, user_id: getUser().id });
	if (userToFamilies) {
		return userToFamilies;
	}
	family.set(families[0]);
};
