import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

export const user = writable<boolean | User>(browser && false);
