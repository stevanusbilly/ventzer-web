import React from "react";
import { useI18n } from "../../i18n/I18nContext";
import { LOCALES } from "../../i18n/locale";

type LanguageTabberProps = {
	variant?: "light" | "dark";
};

const LanguageTabber: React.FC<LanguageTabberProps> = ({ variant = "light" }) => {
	const { locale, setLocale, t } = useI18n();

	return (
		<div
			className={`vz-lang vz-lang-${variant}`}
			role="tablist"
			aria-label={t("lang.label")}
		>
			{LOCALES.map((code) => (
				<button
					key={code}
					type="button"
					role="tab"
					aria-selected={locale === code}
					className={locale === code ? "is-on" : ""}
					onClick={() => setLocale(code)}
				>
					{code.toUpperCase()}
				</button>
			))}
		</div>
	);
};

export default LanguageTabber;
