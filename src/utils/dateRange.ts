export const formatDateOnly = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const lastNDaysRange = (days: number): [Date, Date] => {
	const to = new Date();
	to.setHours(0, 0, 0, 0);
	const from = new Date(to);
	from.setDate(from.getDate() - (days - 1));
	return [from, to];
};

export const toDateQueryParams = (
	dateRange: (Date | null)[],
): { dateFrom?: string; dateTo?: string } => {
	const from = dateRange[0];
	const to = dateRange[1] || dateRange[0];
	return {
		dateFrom: from ? formatDateOnly(from) : undefined,
		dateTo: to ? formatDateOnly(to) : undefined,
	};
};
