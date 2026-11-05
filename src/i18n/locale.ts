export const LOCALES = ["id", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_STORAGE_KEY = "ventzer.locale";

export const isLocale = (value: string | null | undefined): value is Locale =>
	value === "id" || value === "en";

export const detectLocale = (): Locale => {
	if (typeof window === "undefined") {
		return "id";
	}
	const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
	if (isLocale(stored)) {
		return stored;
	}
	const browser = window.navigator.language.toLowerCase();
	return browser.startsWith("en") ? "en" : "id";
};
