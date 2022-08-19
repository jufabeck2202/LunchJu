import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = (params) => {
	if (params.params.lunchId) {
		return;
	}
	console.log('help');
	//TODO check if exists
	throw redirect(302, '/overview');
};
