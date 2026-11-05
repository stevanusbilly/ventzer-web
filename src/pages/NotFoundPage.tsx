import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MarketingShell from "../components/Marketing/MarketingShell";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { homePathForRole } from "../utils/authPaths";

const NotFoundPage: React.FC = () => {
	const { t } = useI18n();
	const { isAuthenticated, user } = useAuth();
	const location = useLocation();

	useEffect(() => {
		document.title = `${t("notfound.title")} — VENTZER`;
		return () => {
			document.title = "VENTZER — One Platform. Every Event.";
		};
	}, [t]);

	return (
		<MarketingShell>
			<section className="mkt-hero mkt-notfound">
				<div className="mkt-wrap mkt-notfound-grid">
					<div>
						<span className="mkt-kicker">{t("notfound.kicker")}</span>
						<h1>{t("notfound.title")}</h1>
						<p className="mkt-lead">{t("notfound.lead")}</p>
						<p className="mkt-notfound-path">
							<code>{location.pathname}</code>
						</p>
						<div className="mkt-actions">
							<Link className="mkt-btn mkt-btn-primary" to="/">
								{t("notfound.home")}
							</Link>
							{isAuthenticated ? (
								<Link
									className="mkt-btn mkt-btn-ghost"
									to={homePathForRole(user?.role)}
								>
									{t("notfound.dashboard")}
								</Link>
							) : (
								<Link className="mkt-btn mkt-btn-ghost" to="/pricing">
									{t("notfound.pricing")}
								</Link>
							)}
						</div>
					</div>
					<div className="mkt-notfound-mark" aria-hidden="true">
						<span>404</span>
					</div>
				</div>
			</section>
		</MarketingShell>
	);
};

export default NotFoundPage;
