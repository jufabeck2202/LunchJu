import { supabase } from '$lib/supabaseclient';
import type { ApiError, User } from '@supabase/supabase-js';

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
