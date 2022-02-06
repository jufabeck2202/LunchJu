import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import { supabase } from './supabaseclient';
import { browser } from '$app/env';

export const user = writable<boolean | User>(browser && false);
if (browser) {
	console.log("wuhuu browser")
	user.set(supabase.auth.user());
	supabase.auth.onAuthStateChange((_, session) => {
		console.log('Auth state changed', session);
		if (session) {
			user.set(session.user);
		} else {
			user.set(false);
		}
	});
} else {
	console.log("wuhuu server")}
