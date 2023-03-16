<script lang="ts">
	import { browser } from '$app/environment';
	import { popup } from '@skeletonlabs/skeleton';
	import type { Medication } from '../app';

	// Props
	/** An array of values to choose from. */
	export let options: Array<Medication>;
	/** The currently selected item(s) */
	export let selected: Medication | undefined;
	/** Provide text for the placeholder */
	export let placeholder: string = 'Enter Medication Name...';
	export let name: string;
	// Props (styles)
	/** Provide classes for menu container */
	export let regionMenu = 'py-4 w-full max-h-48 overflow-y-auto';
	/** Provide classes for menu options */
	export let option = 'bg-inherit hover:brightness-105 dark:hover:brightness-110 scroll-my-2';
	/** Provide classes for menu options focussed by the arrow keys */
	export let optionFocus = 'bg-surface-300-700-token variant-ring-tertiary ring-2';
	/** Provide classes for the background  */
	export let background = 'bg-surface-200-700-token';
	/** Provide classes for the border */
	export let border = 'border-surface-400-500-token';
	/** Provide classes for the padding */
	export let padding = 'p-2';
	/** Provide classes for the width */
	export let width = 'max-w-96';
	/** Provide classes for border radius styles */
	export let rounded = 'rounded-12';
	/** Provide classes for the input */
	export let input = 'input input-select';

	const cOption = 'py-1 my-1 w-full';

	// Local variables
	let menuExpanded = false;
	let searchTerm = selected?.name || '';
	let focusIndex = 0;
	let focusFrom: 'keyboard' | 'mouse' = 'mouse';

	function handleKeypress(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			focusIndex++;
			if (focusIndex >= filteredOptions.length) {
				focusIndex = 0;
			}
		} else if (event.key === 'ArrowUp') {
			focusIndex--;
			if (focusIndex < 0) {
				focusIndex = filteredOptions.length - 1;
			}
		} else if (event.key === 'Enter') {
			if (filteredOptions.length > 0) {
				setSelected(filteredOptions[focusIndex]);
			}
		}
		document
			.querySelector('[data-popup="' + name + '"]')
			?.children.item(focusIndex)
			?.scrollIntoView();
	}

	function getFilteredOptions(searchTerm: string, options: Array<Medication>) {
		if (searchTerm) {
			return options.filter((option, i) => {
				const shouldInclude = option.name.toLowerCase().includes(searchTerm.toLowerCase());
				if (!shouldInclude) {
					if (focusIndex > i) {
						focusIndex--;
					}
					if (focusIndex === i) {
						focusIndex = 0;
					}
				}
				return shouldInclude;
			});
		}
		return options;
	}

	function setSelected(option: Medication) {
		searchTerm = option.name;
		// handleMaterialChange(option);

		// close the popup
		document.getElementById(name)?.click();
	}

	if (browser) {
		document.addEventListener('click', (_) => {
			focusFrom = 'mouse';
		});
		document.addEventListener('keydown', (_) => {
			focusFrom = 'keyboard';
		});
	}
	function ignoreEnterKey(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	}

	$: filteredOptions = getFilteredOptions(searchTerm, options);

	$: classesMenu = `${rounded} ${regionMenu} ${padding} ${background} ${border}`;
	$: classesOption = `${rounded} ${cOption} ${option} ${padding}`;
	$: classesOptionFocus = `${optionFocus}`;
	$: classesInput = `${input} ${rounded} ${background} `;
</script>

<div class="relative {width}">
	<input
		type="text"
		class="search-input {classesInput}"
		id={name}
		{name}
		{placeholder}
		on:keydown={ignoreEnterKey}
		on:keypress={ignoreEnterKey}
		on:keyup={handleKeypress}
		bind:value={searchTerm}
		on:focus={async (e) => {
			if (!menuExpanded && focusFrom === 'keyboard') {
				e.target?.dispatchEvent(new Event('click'));
			}
		}}
		on:blur={async (e) => {
			if (menuExpanded) {
				e.target?.dispatchEvent(new Event('click'));
			}
		}}
		on:input={(e) => {
			if (!menuExpanded) {
				e.target?.dispatchEvent(new Event('click'));
			}
		}}
		use:popup={{
			target: name,
			state(s) {
				menuExpanded = s.state;
				if (menuExpanded && focusFrom === 'mouse') {
					if (document.activeElement && document.activeElement.id === name) {
						searchTerm = '';
						focusIndex = 0;
					}
				}
			},
			event: 'click',
			closeQuery: 'li[role="option"]'
		}}
	/>
	<ul
		role="combobox"
		data-popup={name}
		aria-expanded={menuExpanded}
		aria-controls={name}
		class="select-menu {classesMenu}"
	>
		{#if filteredOptions.length > 0}
			{#each filteredOptions as option, i (option.name)}
				<!-- svelte-ignore a11y-click-events-have-key-events since this element cannot be focussed by the keyboard-->
				<li
					role="option"
					aria-selected={selected === option}
					class="select-option {classesOption} {i === focusIndex ? classesOptionFocus : ''}"
					on:click={() => setSelected(option)}
				>
					{option.name}
				</li>
			{/each}
		{/if}
	</ul>
</div>
