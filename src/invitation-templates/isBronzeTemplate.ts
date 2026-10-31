export const isBronzeTemplate = (event: {
	templateId?: number;
	templateName?: string;
}): boolean => {
	const name = String(event.templateName || "").toLowerCase();
	return event.templateId === 1 || name.includes("bronze");
};
