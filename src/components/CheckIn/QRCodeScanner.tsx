import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./QRCodeScanner.css";

interface QRCodeScannerProps {
	visible: boolean;
	onHide: () => void;
	onScanSuccess: (decodedText: string) => void;
	onScanError?: (errorMessage: string) => void;
}

const SCANNER_ID = "checkin-live-scanner";

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

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
	visible,
	onHide,
	onScanSuccess,
	onScanError,
}) => {
	const [status, setStatus] = useState<"starting" | "ready" | "error">("starting");
	const [error, setError] = useState("");
	const [retry, setRetry] = useState(0);
	const [dialogReady, setDialogReady] = useState(false);
	const scannerRef = useRef<{
		getState?: () => number;
		stop: () => Promise<void>;
		clear: () => void;
	} | null>(null);
	const onScanRef = useRef(onScanSuccess);
	const lockedRef = useRef(false);

	onScanRef.current = onScanSuccess;

	useEffect(() => {
		if (!visible) {
			setDialogReady(false);
			lockedRef.current = false;
			const current = scannerRef.current;
			scannerRef.current = null;
			if (current) {
				void safeStop(current);
			}
			return;
		}

		if (!dialogReady) {
			return;
		}

		let alive = true;
		lockedRef.current = false;

		const startCamera = async (): Promise<void> => {
			setStatus("starting");
			setError("");
			await delay(50);
			if (!alive) {
				return;
			}

			const container = document.getElementById(SCANNER_ID);
			if (!container) {
				throw new Error("Area kamera tidak siap");
			}
			container.replaceChildren();

			const { Html5Qrcode } = await import("html5-qrcode");
			if (!alive) {
				return;
			}

			const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
			scannerRef.current = scanner;

			const config = {
				fps: 15,
				qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
					const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
					return { width: Math.max(180, size), height: Math.max(180, size) };
				},
				aspectRatio: 1,
				disableFlip: false,
			};

			const onDecoded = (decodedText: string): void => {
				if (lockedRef.current) {
					return;
				}
				lockedRef.current = true;
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
				await scanner.start(
					cameras[cameras.length - 1].id,
					config,
					onDecoded,
					() => undefined,
				);
			}

			if (!alive) {
				await safeStop(scanner);
				return;
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
			onScanError?.(message);
		});

		return () => {
			alive = false;
			const current = scannerRef.current;
			scannerRef.current = null;
			if (current) {
				void safeStop(current);
			}
		};
	}, [visible, dialogReady, retry, onScanError]);

	const handleClose = (): void => {
		onHide();
	};

	return (
		<Dialog
			header="Scan QR Tamu"
			visible={visible}
			style={{ width: "92vw", maxWidth: "420px" }}
			onHide={handleClose}
			onShow={() => setDialogReady(true)}
			className="qr-scanner-dialog"
			dismissableMask
		>
			<div className="checkin-camera-shell">
				<div id={SCANNER_ID} className="checkin-live-scanner" />
				<div className="checkin-viewfinder" aria-hidden="true">
					<span className="c tl" />
					<span className="c tr" />
					<span className="c bl" />
					<span className="c br" />
				</div>
				<div className="checkin-camera-hint">
					{status === "starting" && <p>Menyalakan kamera…</p>}
					{status === "ready" && <p>Arahkan QR undangan ke kamera</p>}
					{status === "error" && <p>{error}</p>}
				</div>
			</div>
			<div className="flex justify-content-center gap-2 mt-3">
				{status === "error" && (
					<Button
						label="Coba lagi"
						icon="pi pi-refresh"
						outlined
						onClick={() => setRetry((value) => value + 1)}
					/>
				)}
				<Button
					label="Tutup"
					icon="pi pi-times"
					className="p-button-secondary"
					onClick={handleClose}
				/>
			</div>
		</Dialog>
	);
};

export default QRCodeScanner;
