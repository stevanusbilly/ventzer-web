import React, { useEffect, useRef, useState } from "react";

type ScannerStatus = "starting" | "ready" | "error";

interface UsherLiveScannerProps {
	active: boolean;
	paused?: boolean;
	onScan: (decodedText: string) => void;
}

const SCANNER_ID = "usher-live-scanner";

const delay = (ms: number): Promise<void> =>
	new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});

const safeStop = async (scanner: {
	getState?: () => number;
	stop: () => Promise<void>;
	clear: () => void;
}): Promise<void> => {
	try {
		const state = scanner.getState?.();
		if (state && state > 1) {
			await scanner.stop();
		}
	} catch {
		// kamera mungkin sudah berhenti
	}
	try {
		scanner.clear();
	} catch {
		// container sudah bersih
	}
};

const UsherLiveScanner: React.FC<UsherLiveScannerProps> = ({
	active,
	paused = false,
	onScan,
}) => {
	const [status, setStatus] = useState<ScannerStatus>("starting");
	const [error, setError] = useState("");
	const scannerRef = useRef<{
		getState?: () => number;
		stop: () => Promise<void>;
		clear: () => void;
		pause: (shouldPauseVideo?: boolean) => void;
		resume: () => void;
	} | null>(null);
	const onScanRef = useRef(onScan);
	const pausedRef = useRef(paused);
	const retryKey = useRef(0);
	const [retry, setRetry] = useState(0);

	onScanRef.current = onScan;
	pausedRef.current = paused;

	useEffect(() => {
		const scanner = scannerRef.current;
		if (!scanner?.getState) {
			return;
		}
		try {
			const state = scanner.getState();
			if (paused && state === 2) {
				scanner.pause(true);
			} else if (!paused && state === 3) {
				scanner.resume();
			}
		} catch {
			// ignore pause/resume race
		}
	}, [paused]);

	useEffect(() => {
		if (!active) {
			const current = scannerRef.current;
			scannerRef.current = null;
			if (current) {
				void safeStop(current);
			}
			return;
		}

		let alive = true;

		const startCamera = async (): Promise<void> => {
			setStatus("starting");
			setError("");
			await delay(80);
			if (!alive) {
				return;
			}

			const container = document.getElementById(SCANNER_ID);
			if (!container) {
				setStatus("error");
				setError("Area kamera tidak siap");
				return;
			}

			const html5QrcodeModule = await import("html5-qrcode");
			const Html5Qrcode = html5QrcodeModule.Html5Qrcode;
			if (!alive) {
				return;
			}

			const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
			scannerRef.current = scanner;

			const config = {
				fps: 15,
				qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
					const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
					return { width: Math.max(200, size), height: Math.max(200, size) };
				},
				aspectRatio:
					window.innerWidth >= window.innerHeight ? 16 / 9 : 3 / 4,
				disableFlip: false,
				rememberLastUsedCamera: true,
			};

			const onDecoded = (decodedText: string): void => {
				if (pausedRef.current) {
					return;
				}
				onScanRef.current(decodedText);
			};

			try {
				await scanner.start(
					{ facingMode: "environment" },
					config,
					onDecoded,
					() => undefined,
				);
			} catch {
				const cameras = await Html5Qrcode.getCameras();
				if (!alive) {
					await safeStop(scanner);
					return;
				}
				if (!cameras.length) {
					throw new Error("Kamera tidak ditemukan");
				}
				await scanner.start(cameras[cameras.length - 1].id, config, onDecoded, () => undefined);
			}

			if (!alive) {
				await safeStop(scanner);
				return;
			}

			if (pausedRef.current) {
				try {
					scanner.pause(true);
				} catch {
					// ignore
				}
			}
			setStatus("ready");
		};

		void startCamera().catch((err: unknown) => {
			if (!alive) {
				return;
			}
			const message =
				err instanceof Error ? err.message : "Kamera tidak bisa dinyalakan";
			setStatus("error");
			setError(
				message.toLowerCase().includes("denied")
					? "Izin kamera ditolak. Izinkan kamera di pengaturan browser, lalu coba lagi."
					: message,
			);
		});

		return () => {
			alive = false;
			const current = scannerRef.current;
			scannerRef.current = null;
			if (current) {
				void safeStop(current);
			}
		};
	}, [active, retry]);

	const handleRetry = (): void => {
		retryKey.current += 1;
		setRetry((value) => value + 1);
	};

	return (
		<div className="usher-camera-shell">
			<div id={SCANNER_ID} className="usher-live-scanner" />
			<div className="usher-viewfinder" aria-hidden="true">
				<span className="usher-corner tl" />
				<span className="usher-corner tr" />
				<span className="usher-corner bl" />
				<span className="usher-corner br" />
				{status === "ready" && !paused && <span className="usher-scan-line" />}
			</div>
			<div className="usher-camera-hint">
				{status === "starting" && <p>Menyalakan kamera…</p>}
				{status === "ready" && <p>Arahkan QR undangan ke dalam bingkai</p>}
				{status === "error" && (
					<div className="usher-camera-error">
						<p>{error}</p>
						<button type="button" onClick={handleRetry}>
							Coba lagi
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default UsherLiveScanner;
