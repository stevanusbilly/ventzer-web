export const isChinesePremiumTemplate = (event: {
	templateName?: string;
}): boolean => {
	const name = String(event.templateName || "").toLowerCase();
	return (
		name.includes("imperial harmony") ||
		(name.includes("chinese") && name.includes("premium"))
	);
};
