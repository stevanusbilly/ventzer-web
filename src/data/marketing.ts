export type PriceTag = {
	current: string;
	was?: string;
};

export type MarketingPackage = {
	id: string;
	name: string;
	eyebrow?: string;
	description: string;
	price: PriceTag;
	features: string[];
	bonus?: string;
	badge?: string;
	highlight?: boolean;
};

export const STARTER_FEATURES = [
	"Fitur Kepada (Nama Tamu)",
	"Sebar Undangan Praktis",
	"Galeri Foto",
	"Navigasi Lokasi / Maps",
	"Musik / Backsound",
	"Amplop Digital",
	"Kolom Ucapan",
];

export const RSVP_PACKAGES: MarketingPackage[] = [
	{
		id: "bronze",
		name: "Paket Bronze",
		eyebrow: "Undangan digital",
		description:
			"Desain minimalis dengan fitur dasar, ideal untuk perayaan formal maupun informal.",
		price: { current: "Rp 125.000" },
		features: ["Starter Fitur", "Maksimal 5 Foto Galeri"],
	},
	{
		id: "silver",
		name: "Paket Silver",
		eyebrow: "Undangan digital",
		description:
			"Untuk yang menginginkan undangan lebih bervariasi dan penuh kesan.",
		price: { current: "Rp 199.000" },
		features: [
			"Starter Fitur",
			"Maksimal 10 Foto Galeri",
			"Foto Profil Pengantin",
			"Social Media Pengantin",
		],
		badge: "Best Seller",
	},
	{
		id: "gold",
		name: "Paket Gold",
		eyebrow: "Undangan digital",
		description:
			"Desain mengesankan dengan fitur yang memudahkan kamu dan tamu undangan.",
		price: { current: "Rp 249.000", was: "Rp 300.000" },
		features: [
			"Starter Fitur",
			"Maksimal 20 Foto Galeri",
			"Foto Profil Pengantin",
			"Social Media Pengantin",
			"RSVP / Konfirmasi Kehadiran",
			"Video Prewedding Player",
		],
		badge: "Paling Dicari",
		highlight: true,
	},
	{
		id: "diamond",
		name: "Paket Diamond",
		eyebrow: "Undangan digital",
		description:
			"Paket terlengkap untuk undangan yang terasa personal sampai hari H.",
		price: { current: "Rp 299.000", was: "Rp 350.000" },
		features: [
			"Starter Fitur",
			"Maksimal 25 Foto Galeri",
			"Foto Profil Pengantin",
			"Social Media Pengantin",
			"RSVP / Konfirmasi Kehadiran",
			"Video Prewedding Player",
			"Add to Calendar",
			"Love Story",
		],
	},
];

export const CUSTOM_RSVP: MarketingPackage = {
	id: "custom",
	name: "Custom Desain",
	eyebrow: "Desain by request",
	description:
		"Wujudkan undangan yang paling unik, dengan seluruh fitur VENTZER.",
	price: { current: "Rp 550.000" },
	features: [
		"Seluruh fitur Diamond",
		"Desain dibuat sesuai request",
		"Konsultasi langsung dengan tim",
		"Revisi hingga desain final",
	],
};

export const ADDONS = [
	{
		title: "Custom Domain",
		detail:
			"Pakai nama couple kamu, misalnya raditjanimenikah.com. Tim kami bantu wujudkan.",
		price: "Hubungi tim",
	},
	{
		title: "Pengerjaan Express",
		detail: "Butuh lebih cepat dari reguler? Kami kerjakan dalam 24 jam kerja.",
		price: "+ Rp 50.000",
	},
];

export const GUESTBOOK_PACKAGE: MarketingPackage = {
	id: "guestbook",
	name: "Buku Tamu Digital",
	eyebrow: "Hari H",
	description:
		"Sistem tamu di lokasi: undangan, RSVP, QR, meja, amplop digital, dan dukungan crew.",
	price: { current: "Rp 2.100.000", was: "Rp 3.000.000" },
	features: [
		"Unlimited Invitation (Manual Send)",
		"Unlimited Revision",
		"Split Invitation",
		"RSVP & QR Code",
		"Personalized Invitation",
		"Background Music",
		"Dashboard User",
		"24/7 Customer Service Support",
		"WA Blast (Automatic)",
		"E-Gift (E-Angpao + Gift Registry)",
		"Printable QR Code File",
		"Printed E-Angpao QR Code",
		"Tablet Devices",
		"Modem Internet",
		"Technical Support Crew",
		"Hours Duration",
		"Table & Seat Management",
	],
};

export const LIVE_STREAM_FEATURES = [
	"Hours of Live Streaming",
	"Live on Youtube / Instagram",
	"File Recording",
	"Modem Internet",
	"Free Wedding Frame",
	"Live Cam to Screen",
	"Camera Movement",
	"Crews",
];

export const LIVE_STREAM_PACKAGES: MarketingPackage[] = [
	{
		id: "live-bronze",
		name: "Bronze",
		eyebrow: "Live Streaming",
		description: "Siaran langsung acara dengan crew, modem, dan rekaman file.",
		price: { current: "Rp 3.700.000", was: "Rp 6.000.000" },
		features: LIVE_STREAM_FEATURES,
		bonus: "Free Undangan Digital Basic",
	},
	{
		id: "live-silver",
		name: "Silver",
		eyebrow: "Live Streaming",
		description: "Paket streaming lengkap plus undangan digital Intimate.",
		price: { current: "Rp 5.250.000", was: "Rp 7.000.000" },
		features: LIVE_STREAM_FEATURES,
		bonus: "Free Undangan Digital Intimate",
		highlight: true,
	},
	{
		id: "live-gold",
		name: "Gold",
		eyebrow: "Live Streaming",
		description: "Streaming premium dengan bonus buku tamu digital.",
		price: { current: "Rp 6.250.000", was: "Rp 10.000.000" },
		features: LIVE_STREAM_FEATURES,
		bonus: "Free Buku Tamu Digital",
	},
];

export const CATALOG_ITEMS = [
	{
		id: "classic",
		name: "Classic Ivory",
		tag: "Elegan",
		image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
	},
	{
		id: "bronze",
		name: "Forest Bronze",
		tag: "Botanical",
		image: "https://hi.nstory.id/wp-content/uploads/2023/03/chinese-2.jpg",
	},
	{
		id: "jawa",
		name: "Template Jawa",
		tag: "Tradisional",
		image: "https://nstory.id/wp-content/uploads/2023/04/KatalogFav.jpg",
	},
	{
		id: "premi",
		name: "Premi 1",
		tag: "Premium",
		image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
	},
	{
		id: "batak",
		name: "Template Batak",
		tag: "Tradisional",
		image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900",
	},
	{
		id: "sumatra",
		name: "Template Sumatra",
		tag: "Tradisional",
		image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900",
	},
];

export const ORDER_STEPS = [
	{
		no: "01",
		title: "Pilih paket & desain",
		desc: "Tentukan undangan digital, buku tamu, atau live streaming. Pilih template dari katalog.",
	},
	{
		no: "02",
		title: "Isi data & konsultasi",
		desc: "Kirim data mempelai, acara, dan referensi. Tidak perlu DP — cukup sekali bayar.",
	},
	{
		no: "03",
		title: "Kami yang kerjakan",
		desc: "Pengerjaan reguler 3–5 hari kerja. Butuh cepat? Paket express 24 jam + Rp 50.000.",
	},
	{
		no: "04",
		title: "Revisi sampai final",
		desc: "Revisi unlimited hingga desain disetujui. Support tetap jalan sampai hari H.",
	},
	{
		no: "05",
		title: "Sebar undangan",
		desc: "Bagikan via WhatsApp dengan nama tamu. RSVP, ucapan, dan kehadiran terpantau di dashboard.",
	},
];

export type FeaturePoint = {
	title: string;
	desc: string;
	icon: string;
};

export type HomeProduct = {
	id: string;
	title: string;
	kicker: string;
	summary: string;
	href: string;
	image: string;
	imageAlt: string;
	features: FeaturePoint[];
};

export const HOME_PRODUCTS: HomeProduct[] = [
	{
		id: "undangan-digital",
		title: "Undangan Digital",
		kicker: "Website undangan",
		summary:
			"Buat website undangan dengan fitur lengkap dan tema yang anggun. Tamu membuka undangan dari nama mereka, lalu sebar lewat WhatsApp sekali ketuk.",
		href: "/pricing",
		image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80",
		imageAlt: "Pasangan melihat undangan digital di ponsel",
		features: [
			{
				title: "Nama Tamu",
				icon: "pi pi-user",
				desc: "Setiap undangan terasa personal. Tamu membuka halaman yang menyapa namanya, bukan undangan massal.",
			},
			{
				title: "Sebar WhatsApp",
				icon: "pi pi-send",
				desc: "Bagikan tautan undangan sekali ketuk. Tidak perlu cetak ratusan kartu atau antri di percetakan.",
			},
			{
				title: "Galeri & Love Story",
				icon: "pi pi-images",
				desc: "Foto, video prewedding, dan kisah kalian mengalir dalam satu alur yang elegan.",
			},
			{
				title: "Maps & Musik",
				icon: "pi pi-map-marker",
				desc: "Tamu langsung buka lokasi acara. Backsound membuat undangan terasa hidup sejak layar pertama.",
			},
			{
				title: "Amplop Digital",
				icon: "pi pi-wallet",
				desc: "Tamu kirim tanda kasih tanpa bingung rekening. Semua masuk rapi di dashboard.",
			},
			{
				title: "RSVP & Ucapan",
				icon: "pi pi-comments",
				desc: "Konfirmasi kehadiran dan ucapan masuk otomatis. Siap dibaca kapan saja menjelang hari H.",
			},
		],
	},
	{
		id: "tamu-digital",
		title: "Buku Tamu Digital",
		kicker: "Hari H di lokasi",
		summary:
			"Tamu tidak perlu antre menulis nama. RSVP jadi QR masuk, discan di pintu, meja langsung ketemu, data tamu terekam rapi.",
		href: "/pricing#tamu-digital",
		image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80",
		imageAlt: "Suasana resepsi dan penyambutan tamu",
		features: [
			{
				title: "RSVP & QR Code",
				icon: "pi pi-qrcode",
				desc: "Tamu konfirmasi kehadiran lalu mendapat QR sebagai tiket masuk venue.",
			},
			{
				title: "Penerima Tamu",
				icon: "pi pi-tablet",
				desc: "Usher memindai QR di tablet. Check-in cepat, tanpa buku basah atau antrian panjang.",
			},
			{
				title: "Table & Seat",
				icon: "pi pi-th-large",
				desc: "Tamu langsung tahu meja dan kursi. Denah dikelola dari dashboard, bukan kertas tempel.",
			},
			{
				title: "Layar Sapa",
				icon: "pi pi-desktop",
				desc: "Nama tamu tampil saat check-in. Penyambutan terasa hangat dan modern.",
			},
			{
				title: "Crew & Perangkat",
				icon: "pi pi-users",
				desc: "Tablet, modem, dan crew teknis hadir di lokasi supaya alur tamu tetap lancar.",
			},
			{
				title: "E-Gift & Angpao QR",
				icon: "pi pi-gift",
				desc: "Amplop digital dan QR angpao tercetak. Tamu bisa kasih tanda kasih tanpa bingung.",
			},
		],
	},
	{
		id: "live-streaming",
		title: "Live Streaming",
		kicker: "Siaran virtual",
		summary:
			"Siarkan akad dan resepsi untuk keluarga yang tidak bisa hadir. Tayang di YouTube atau Instagram, lengkap dengan rekaman yang bisa disimpan.",
		href: "/pricing#live-streaming",
		image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80",
		imageAlt: "Momen pernikahan yang siap disiarkan",
		features: [
			{
				title: "YouTube / Instagram",
				icon: "pi pi-video",
				desc: "Siaran masuk ke platform yang sudah dipakai keluarga, tanpa aplikasi tambahan.",
			},
			{
				title: "Camera Movement",
				icon: "pi pi-camera",
				desc: "Kamera bergerak mengikuti momen, bukan sudut diam yang terasa kaku.",
			},
			{
				title: "Wedding Frame",
				icon: "pi pi-stop",
				desc: "Frame pernikahan custom membuat siaran terasa seperti film, bukan rekaman mentah.",
			},
			{
				title: "Full Record",
				icon: "pi pi-download",
				desc: "Seluruh siaran direkam. Kenangan utuh bisa ditonton lagi kapan saja.",
			},
			{
				title: "Live Cam to Screen",
				icon: "pi pi-desktop",
				desc: "Tamu di venue menonton layar yang sama dengan keluarga di rumah.",
			},
			{
				title: "Crew & Modem",
				icon: "pi pi-wifi",
				desc: "Tim dan koneksi cadangan berangkat ke lokasi, jadi siaran tidak bergantung Wi-Fi hotel.",
			},
		],
	},
];

export const HOME_QUOTES = [
	{
		quote:
			"Undangannya terasa personal banget. Orang tua sampai baca love story sampai akhir, RSVP-nya juga rapi di dashboard.",
		couple: "Sari & Bagas",
		place: "Bandung",
	},
	{
		quote:
			"Antrian di pintu hilang. Tamu scan QR, nama muncul, meja langsung ketemu. Buku tamu digitalnya yang paling kami syukuri.",
		couple: "Lila & Arya",
		place: "Jakarta",
	},
	{
		quote:
			"Om dan tante di luar kota nonton akad dari rumah. Siarannya halus, rekaman filenya juga lengkap buat kenang-kenangan.",
		couple: "Nia & Farhan",
		place: "Surabaya",
	},
];

export const HOME_PILLARS = [
	{
		icon: "pi pi-send",
		title: "Digital Invitation & RSVP",
		desc: "Undang tamu secara personal, kumpulkan konfirmasi kehadiran, dan pantau semuanya dari satu dashboard.",
	},
	{
		icon: "pi pi-users",
		title: "Guest Management",
		desc: "Kelola daftar tamu, meja, dan status RSVP tanpa spreadsheet yang berceceran.",
	},
	{
		icon: "pi pi-qrcode",
		title: "Event Check-in",
		desc: "Scan QR di pintu, sapa tamu, dan catat kehadiran secara real-time.",
	},
	{
		icon: "pi pi-video",
		title: "Live Streaming",
		desc: "Siarkan acara ke YouTube atau Instagram, lengkap dengan rekaman untuk keluarga yang jauh.",
	},
];

export const HOME_TRUST = [
	"One platform, every event",
	"Invitation, RSVP, check-in",
	"Guest management realtime",
	"Live streaming ready",
	"Tema undangan tetap fleksibel",
];

export const MARKETING_FAQS = [
	{
		question: "Berapa lama proses pengerjaan?",
		answer:
			"Paket reguler 3–5 hari kerja, custom desain 5–7 hari kerja. Waktu bisa berubah tergantung antrian. Paket express tersedia dengan tambahan Rp 50.000 untuk pengerjaan 24 jam kerja.",
	},
	{
		question: "Apakah revisi dikenakan biaya?",
		answer:
			"Tidak. Revisi gratis dan kami memberi dukungan sampai hari H.",
	},
	{
		question: "Berapa masa aktif undangan?",
		answer:
			"Masa aktif 6 bulan terhitung setelah hari H. Sebelum acara, undangan tetap aktif tanpa biaya tambahan.",
	},
	{
		question: "Pemesanan sebaiknya H-berapa?",
		answer:
			"Idealnya sekitar 1 bulan sebelum acara. Jika mendesak, kami tetap bisa membantu termasuk pengerjaan kurang dari 1 hari dengan paket express.",
	},
	{
		question: "Bisa untuk acara selain pernikahan?",
		answer:
			"Bisa. Sampaikan kebutuhan undangannya, tim kami siap menyesuaikan.",
	},
	{
		question: "Bisa memakai bahasa selain Indonesia?",
		answer:
			"Tentu. Sampaikan bahasa yang ingin dipakai di undangan.",
	},
];
