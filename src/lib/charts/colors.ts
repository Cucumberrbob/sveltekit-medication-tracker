import { browser } from '$app/environment';

function numsToRGB(nums: string, opacity = 1) {
	const [r, g, b] = nums.split(' ');
	return `rgba(${r},${g},${b} , ${opacity})`;
}

export default !browser
	? [
			{
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				hoverBackgroundColor: 'rgba(255, 99, 132, 0.3)'
			}
	  ]
	: [
			{
				backgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500'),
					0.6
				),
				borderColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-primary-700')
				),
				hoverBackgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500'),
					0.8
				)
			},
			{
				backgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-500'),
					0.6
				),
				borderColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-700')
				),
				hoverBackgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-500'),
					0.8
				)
			},
			{
				backgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-tertiary-500'),
					0.6
				),
				borderColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-tertiary-700')
				),
				hoverBackgroundColor: numsToRGB(
					getComputedStyle(document.documentElement).getPropertyValue('--color-tertiary-500'),
					0.8
				)
			},
			// tailwind orange
			{
				backgroundColor: 'rgb(249 115 22 / 0.6)',
				borderColor: 'rgb(124 45 18)',
				hoverBackgroundColor: 'rgb(249 115 22 / 0.8)'
			},
			//tailwind yellow
			{
				backgroundColor: 'rgb(255 152 0 / 0.6)',
				borderColor: 'rgb(161 98 7)',
				hoverBackgroundColor: 'rgb(255 152 0 / 0.8)'
			},
			//tailwind green
			{
				backgroundColor: 'rgb(34 197 94 / 0.6)',
				borderColor: 'rgb(21 128 61)',
				hoverBackgroundColor: 'rgb(34 197 94 / 0.8)'
			},
			//tailwind teal
			{
				backgroundColor: 'rgb(20 184 166 / 0.8)',
				borderColor: 'rgb(15 118 110)',
				hoverBackgroundColor: 'rgb(20 184 166 / 0.8)'
			}
	  ];
