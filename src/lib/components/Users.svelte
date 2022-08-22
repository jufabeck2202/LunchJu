<script lang="ts">
	import { familyUsers, getUserName } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import { t } from '$lib/helpers/i18n';
	const channel = supabase
		.channel('online-users')

		.on('presence', { event: 'sync' }, () => {
			console.log('currently online users', channel.presenceState());
		})
		.on('presence', { event: 'join' }, ({ newUser }) => {
			console.log('a new user has joined', newUser);
		})
		.on('presence', { event: 'leave' }, ({ leftUser }) => console.log('a user has left', leftUser))
		.subscribe(async (status) => {
			if (status === 'SUBSCRIBED') {
				const status = await channel.track({ user_name: getUserName() });
				console.log(status);
			}
		});
</script>

<div>
	<div class="card has-background-light pb-3 is card-radius-">
		<header class="card-header">
			<p class="card-header-title">{$t('family-members')}</p>
		</header>
		<div class="content">
			{#each $familyUsers as user, i}
				<div class="level pt-2 is-mobile">
					<div class="level-item level-left">
						<figure class="image is-32x32">
							<img
								class="is-rounded"
								src={`https://avatars.dicebear.com/api/pixel-art/${user.name}.svg`}
								alt="avatar" />
						</figure>
					</div>
					<div class="level-item">
						<span class="title is-5 ">{user.name}</span>
					</div>
					<div class="level-item has-text-centered">
						<span class="tag is-success"> online </span>
					</div>
					<div class="level-item has-text-centered">
						<span class="tag is-warning"> offline </span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
</style>
