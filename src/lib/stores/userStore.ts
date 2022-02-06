import { supabase } from '$lib/supabaseclient';
import type { ApiError, User } from '@supabase/supabase-js';
import type { definitions } from '$lib/models';
import { user } from '$lib/userWritableStore';
import { writable } from 'svelte/store';

export const familyID = writable<string | null>(null);
export const family = writable<definitions['families'] | null>(null);

export function getUser() {
	return supabase.auth.user();
}

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
		.eq('user_id', getUser().id)
		.single();
	if (error || !data || !data.user_id) {
		return false;
	}
	familyID.set(data.families_id);
	console.log("User's family exists");

	return true;
};

export const getFamily = async (): Promise<definitions['families']> => {
	const { data, error } = await supabase.from<definitions['families']>('families');
};

export const createFamily = async (familyName) => {
	console.log('creating Family');
	const { data: families, error } = await supabase
		.from<definitions['families']>('families')
		.insert({ name: familyName, creator_id: getUser().id });

	await supabase
		.from<definitions['users_to_families']>('users_to_families')
		.insert({ families_id: families[0].id, user_id: getUser().id });
};
