import { supabase } from '$lib/supabaseclient';
import type { ApiError, PostgrestError, RealtimeSubscription, User } from '@supabase/supabase-js';
import type { definitions } from '$lib/models';
import { user } from '$lib/userWritableStore';
import { writable } from 'svelte/store';

export const family = writable<definitions['families'] | null>(null);

export const lunches = writable<definitions['lunchs'][] | []>([]);
export function getUser() {
	return supabase.auth.user();
}

let familyID: string | null = null;
let lunchSubscription: RealtimeSubscription;

const familySubscription = family.subscribe(async (family) => {
	if (family) {
		await fetchLunches(family.id);
		lunchSubscription = await supabase
			.from<definitions['lunchs']>('lunchs')
			.on('INSERT', (lunch) => {
				console.log(lunch.new)
				lunches.update((l) => [lunch.new, ...l]);
			
			})
			.subscribe();
		familyID = family.id;
	}
});

const destory = () => {
	lunchSubscription.unsubscribe();
};

export const fetchLunches = async (family_id) => {
	const { data, error } = await supabase
		.from<definitions['lunchs']>('lunchs')
		.select('*')
		.order('created_at', { ascending: false })
		.eq('family_id', family_id)
		.limit(3);
	console.log(data, error);
	lunches.set(data);
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
