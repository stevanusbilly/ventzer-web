import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { detectLocale, Locale, LOCALE_STORAGE_KEY } from "./locale";
import { translate, UiKey } from "./ui";

type I18nContextValue = {
	locale: Locale;
	setLocale: (next: Locale) => void;
	t: (key: UiKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [locale, setLocaleState] = useState<Locale>(detectLocale);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
		window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
		document.documentElement.lang = next;
	}, []);

	const value = useMemo<I18nContextValue>(
		() => ({
			locale,
			setLocale,
			t: (key) => translate(locale, key),
		}),
		[locale, setLocale],
	);

	React.useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useI18n must be used within I18nProvider");
	}
	return ctx;
};
