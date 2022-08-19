<script lang="ts">
	import { user } from '$lib/userWritableStore';

	import { familyUsers } from '$lib/stores/userStore';
</script>

<div>
	<div class="card has-background-light pb-3 is card-radius-">
		<header class="card-header">
			<p class="card-header-title">Family Members:</p>
		</header>
		<div class="content">
			{#each $familyUsers as user, i}
				<div class="level pt-2 is-mobile">
					<div class="level-item level-left">
						<figure class="image is-32x32">
							<img
								class="is-rounded"
								src={`https://avatars.dicebear.com/api/pixel-art/${user.name}.svg`}
								alt="avatar"
							/>
						</figure>
					</div>
					<div class="level-item">
						<span class="title is-5 ">{user.name}</span>
					</div>
					<!-- <div class="level-item has-text-centered">
						<span class="tag is-success"> online </span>
					</div> -->
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
</style>
