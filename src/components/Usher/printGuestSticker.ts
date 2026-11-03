const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const tableLabel = (tableName?: string | null): string => {
	const value = String(tableName || "").trim();
	if (!value) {
		return "";
	}
	return /^meja\b/i.test(value) ? value : `Meja ${value}`;
};

export const printGuestGiftSticker = async (payload: {
	guestName: string;
	eventName: string;
	couple?: string;
	tableName?: string | null;
	qrBlob: Blob;
}): Promise<void> => {
	const qrUrl = URL.createObjectURL(payload.qrBlob);
	const couple = payload.couple || payload.eventName;
	const table = tableLabel(payload.tableName);
	const printWindow = window.open("", "_blank", "width=420,height=420");
	if (!printWindow) {
		URL.revokeObjectURL(qrUrl);
		throw new Error("Popup print diblokir. Izinkan pop-up untuk mencetak stiker.");
	}

	printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Stiker ${escapeHtml(payload.guestName)}</title>
	<style>
		@page { size: 80mm 60mm; margin: 0; }
		html, body {
			margin: 0;
			padding: 0;
			width: 80mm;
			height: 60mm;
			overflow: hidden;
			background: #fff;
			font-family: Georgia, "Times New Roman", serif;
			color: #2c332b;
		}
		.sticker {
			width: 80mm;
			height: 60mm;
			padding: 3mm 4mm;
			box-sizing: border-box;
			text-align: center;
			overflow: hidden;
			page-break-inside: avoid;
			break-inside: avoid;
			page-break-after: avoid;
		}
		.kicker {
			font-size: 8px;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			color: #8a7347;
			margin: 0 0 1mm;
			line-height: 1.2;
		}
		.couple {
			font-size: 11px;
			margin: 0 0 2mm;
			line-height: 1.2;
		}
		img {
			width: 22mm;
			height: 22mm;
			object-fit: contain;
			display: block;
			margin: 0 auto;
		}
		.name {
			font-size: 16px;
			margin: 2mm 0 1mm;
			line-height: 1.15;
		}
		.meta {
			font-size: 10px;
			margin: 0;
			color: #5c635b;
			line-height: 1.2;
		}
		.mark {
			font-size: 8px;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			margin: 1.5mm 0 0;
			color: #8a7347;
			line-height: 1.2;
		}
	</style>
</head>
<body>
	<div class="sticker">
		<p class="kicker">Pemberian Tamu</p>
		<p class="couple">${escapeHtml(couple)}</p>
		<img src="${qrUrl}" alt="QR tamu" />
		<h1 class="name">${escapeHtml(payload.guestName)}</h1>
		${table ? `<p class="meta">${escapeHtml(table)}</p>` : ""}
		<p class="mark">Tempel pada kado</p>
	</div>
	<script>
		function doPrint() {
			window.focus();
			window.print();
		}
		var img = document.querySelector("img");
		if (!img || img.complete) {
			setTimeout(doPrint, 50);
		} else {
			img.onload = function () { setTimeout(doPrint, 50); };
			img.onerror = doPrint;
		}
	</script>
</body>
</html>`);
	printWindow.document.close();
	window.setTimeout(() => URL.revokeObjectURL(qrUrl), 60_000);
};
