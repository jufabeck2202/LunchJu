import { toast } from '@zerodevx/svelte-toast';
export const SuccessToast = (message: string) =>
	toast.push(message, {
		duration: 1000,
		theme: {
			'--toastBackground': '#00c4a7',
			'--toastColor': 'white',
			'--toastBarBackground': '#f5f5f5',
			'--toastBorderRadius': '7px'
		}
	});

export const ErrorToast = (message: string) =>
	toast.push(message, {
		duration: 4000,
		theme: {
			'--toastBackground': '#df6c6c',
			'--toastColor': 'white',
			'--toastBarBackground': '#f5f5f5',
			'--toastBorderRadius': '7px'
		}
	});
