<script lang="ts">
	import { animate } from "animejs";
	import { onMount } from "svelte";

	interface Props {
		delay?: number;
	}

	let { delay = 0 }: Props = $props();

	let wrapper: HTMLElement;
	let revealed = false;

	onMount(() => {
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) return;

		const els = wrapper.querySelectorAll<HTMLElement>("[data-anime]");
		if (!els.length) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !revealed) {
					revealed = true;

					animate(els, {
						opacity: [0, 1],
						translateY: [24, 0],
						duration: 600,
						ease: "outExpo",
						delay: (_, i) => delay + 100 + i * 80,
					});

					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(wrapper);
		return () => observer.disconnect();
	});
</script>

<div bind:this={wrapper}>
	<slot />
</div>
