import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

// Dynamic import untuk avoid SSR issues
let Html5QrcodeScanner: any = null;

if (typeof window !== 'undefined') {
	import('html5-qrcode').then((module) => {
		Html5QrcodeScanner = module.Html5QrcodeScanner;
	});
}

interface QRCodeScannerProps {
	visible: boolean;
	onHide: () => void;
	onScanSuccess: (decodedText: string) => void;
	onScanError?: (errorMessage: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
	visible,
	onHide,
	onScanSuccess,
	onScanError,
}) => {
	const [scanning, setScanning] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [cameraPermission, setCameraPermission] = useState<
		'granted' | 'denied' | 'prompt'
	>('prompt');
	const scannerRef = useRef<any>(null);
	const scannerContainerId = 'qr-scanner-container';

	// Check camera permissions
	useEffect(() => {
		const checkCameraPermission = async () => {
			try {
				// Pastikan kita berada di lingkungan browser
				if (typeof navigator !== 'undefined' && navigator.permissions) {
					const permissionStatus = await navigator.permissions.query({
						name: 'camera' as PermissionName,
					});
					setCameraPermission(permissionStatus.state);

					permissionStatus.onchange = () => {
						setCameraPermission(permissionStatus.state);
					};
				}
			} catch (error) {
				console.warn('Camera permission API not supported');
			}
		};

		if (visible) {
			checkCameraPermission();
		}
	}, [visible]);

	useEffect(() => {
		if (visible) {
			initScanner();
		} else {
			stopScanner();
		}

		return () => {
			stopScanner();
		};
	}, [visible]);

	const initScanner = async (): Promise<void> => {
		try {
			setError('');
			setIsLoading(true);
			setScanning(false);

			// Clear any existing scanner
			stopScanner();

			// Pastikan kita berada di lingkungan browser
			if (typeof window === 'undefined') {
				throw new Error('Window object not available');
			}

			// Dynamically import the library only when needed
			const html5QrcodeModule = await import('html5-qrcode');
			const Html5QrcodeScanner = html5QrcodeModule.Html5QrcodeScanner;

			// Give time for DOM to render
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Pastikan elemen container ada
			const container = document.getElementById(scannerContainerId);
			if (!container) {
				throw new Error('Scanner container not found');
			}

			// Create scanner instance
			scannerRef.current = new Html5QrcodeScanner(
				scannerContainerId,
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
					rememberLastUsedCamera: true,
					supportedScanTypes: [],
				},
				false
			);

			// Start scanning
			scannerRef.current.render(
				(decodedText: string) => {
					console.log('QR Code scanned:', decodedText);
					onScanSuccess(decodedText);
					stopScanner();
					onHide();
				},
				(errorMessage: string) => {
					// Ignore "No QR code found" errors as they are frequent during scanning
					if (!errorMessage.includes('No QR code found')) {
						console.warn('Scan error:', errorMessage);
						setError(`Scan error: ${errorMessage}`);
						onScanError?.(errorMessage);
					}
				}
			);

			setScanning(true);
			setIsLoading(false);
		} catch (err: any) {
			console.error('Scanner initialization error:', err);
			const errorMsg = err.message || 'Camera access denied or not available';
			setError(`Scanner failed to start: ${errorMsg}`);
			setIsLoading(false);
			setScanning(false);

			// Update camera permission status if access was denied
			if (errorMsg.toLowerCase().includes('denied')) {
				setCameraPermission('denied');
			}
		}
	};

	const stopScanner = (): void => {
		if (scannerRef.current) {
			try {
				// Html5QrcodeScanner memiliki metode clear() untuk membersihkan scanner
				scannerRef.current.clear().catch((err: any) => {
					console.warn('Error clearing scanner:', err);
				});
			} catch (error) {
				console.warn('Error clearing scanner:', error);
			} finally {
				scannerRef.current = null;
			}
		}
		setScanning(false);
	};

	const handleClose = (): void => {
		stopScanner();
		onHide();
	};

	const retryScanner = (): void => {
		setError('');
		initScanner();
	};

	const renderCameraPermissionMessage = () => {
		if (cameraPermission === 'denied') {
			return (
				<div className='mb-3'>
					<Message
						severity='error'
						text='Camera access denied. Please enable camera permissions in your browser settings.'
						className='w-full mb-2'
					/>
					<p className='text-sm'>To enable camera access:</p>
					<ul className='text-sm ml-3 mt-1'>
						<li>Look for the camera icon in your browser's address bar</li>
						<li>Click it and select "Allow" for camera access</li>
						<li>Refresh the page and try again</li>
					</ul>
				</div>
			);
		}

		return null;
	};

	const renderScannerContent = () => {
		if (isLoading) {
			return (
				<div className='p-4'>
					<ProgressSpinner
						style={{ width: '50px', height: '50px' }}
						strokeWidth='4'
						animationDuration='.5s'
					/>
					<p className='mt-3'>Loading scanner...</p>
				</div>
			);
		}

		if (error) {
			return (
				<div className='p-4'>
					<Message severity='error' text={error} className='w-full mb-2' />
					<Button
						label='Retry'
						icon='pi pi-refresh'
						className='p-button-outlined p-button-sm'
						onClick={retryScanner}
					/>
				</div>
			);
		}

		return (
			<div className='p-4'>
				<i className='pi pi-camera text-4xl text-500'></i>
				<p>Scanner ready</p>
			</div>
		);
	};

	return (
		<Dialog
			header='Scan QR Code'
			visible={visible}
			style={{ width: '90vw', maxWidth: '500px' }}
			onHide={handleClose}
			className='qr-scanner-dialog'
			dismissableMask={true}
		>
			<div className='text-center'>
				{renderCameraPermissionMessage()}

				<div
					id={scannerContainerId}
					style={{
						width: '100%',
						minHeight: '300px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: '#f0f0f0',
						borderRadius: '8px',
						marginBottom: '1rem',
						overflow: 'hidden',
					}}
				>
					{renderScannerContent()}
				</div>

				<div className='flex gap-2 justify-content-center'>
					<Button
						label='Close'
						icon='pi pi-times'
						className='p-button-secondary'
						onClick={handleClose}
					/>
					{error && (
						<Button
							label='Retry'
							icon='pi pi-refresh'
							className='p-button-outlined'
							onClick={retryScanner}
						/>
					)}
				</div>

				<div className='mt-3 text-sm'>
					<p className='text-500 mb-1'>Point camera at guest's QR code</p>
					<small>
						Ensure good lighting and steady hands for better scanning
					</small>
				</div>
			</div>
		</Dialog>
	);
};

export default QRCodeScanner;
