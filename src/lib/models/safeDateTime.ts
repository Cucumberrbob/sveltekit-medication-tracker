export function safeDate(date: Date | string) {
	return date instanceof Date ? date : new Date(date);
}
