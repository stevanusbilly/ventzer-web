import React, { useEffect, useRef } from "react";

type GoogleSignInButtonProps = {
	onToken: (idToken: string) => void;
};

type GoogleAccounts = {
	accounts: {
		id: {
			initialize: (config: {
				client_id: string;
				callback: (response: { credential?: string }) => void;
			}) => void;
			renderButton: (
				parent: HTMLElement,
				options: { theme: string; size: string; text: string; width: number },
			) => void;
		};
	};
};

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onToken }) => {
	const hostRef = useRef<HTMLDivElement>(null);
	const clientId = String(process.env.REACT_APP_GOOGLE_CLIENT_ID || "").trim();

	useEffect(() => {
		if (!clientId || !hostRef.current) {
			return;
		}

		const render = (): void => {
			const google = (window as Window & { google?: GoogleAccounts }).google;
			if (!google || !hostRef.current) {
				return;
			}
			google.accounts.id.initialize({
				client_id: clientId,
				callback: (response) => {
					if (response.credential) {
						onToken(response.credential);
					}
				},
			});
			hostRef.current.innerHTML = "";
			google.accounts.id.renderButton(hostRef.current, {
				theme: "outline",
				size: "large",
				text: "signin_with",
				width: 320,
			});
		};

		if ((window as Window & { google?: GoogleAccounts }).google) {
			render();
			return;
		}

		const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
		if (existing) {
			existing.addEventListener("load", render);
			return () => existing.removeEventListener("load", render);
		}

		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.dataset.googleGsi = "true";
		script.addEventListener("load", render);
		document.body.appendChild(script);
		return () => script.removeEventListener("load", render);
	}, [clientId, onToken]);

	if (!clientId) {
		return null;
	}

	return <div className="login-google" ref={hostRef} />;
};

export default GoogleSignInButton;
