import { createClient } from '@supabase/supabase-js';
import type { Database } from './DatabaseDefinitions';

export const supabase = createClient<Database>(
	import.meta.env.VITE_APP_SUPABASE_URL as string,
	import.meta.env.VITE_APP_SUPABASE_PUBLIC_KEY as string
);
