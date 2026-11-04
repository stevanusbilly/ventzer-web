import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import EventForm from "./EventForm";
import EventAssignmentDialog from "./EventAssignmentDialog";
import WeddingForm from "../Wedding/WeddingForm";
import EventLocationDialog from "../EventLocation/EventLocationDialog";
import EventPhotoDialog from "../EventPhoto/EventPhotoDialog";
import EventSettingDialog from "../EventSetting/EventSettingDialog";
import EventTableDialog from "../EventTable/EventTableDialog";
import GuestDialog from "../Guests/GuestDialog";
import GiftDialog from "../Gift/GiftDialog";
import GuestMessageDialog from "../GuestMessage/GuestMessageDialog";
import { Event } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { eventService } from "../../services/eventService";
import { getApiErrorMessage, getApiSuccessMessage } from "../../utils/apiError";
import "./EventManageDialog.css";

interface EventManageDialogProps {
	event: Event;
	onHide: () => void;
	onChanged: (message?: string) => void;
	onError: (message: string) => void;
}

interface ManageCard {
	key: string;
	icon: string;
	title: string;
	hint: string;
	danger?: boolean;
	onClick: () => void;
}

const EventManageDialog: React.FC<EventManageDialogProps> = ({
	event,
	onHide,
	onChanged,
	onError,
}) => {
	const { isAdmin, canMutate } = useAuth();
	const [showForm, setShowForm] = useState(false);
	const [showAssignment, setShowAssignment] = useState(false);
	const [showWedding, setShowWedding] = useState(false);
	const [showLocation, setShowLocation] = useState(false);
	const [showPhoto, setShowPhoto] = useState(false);
	const [showSetting, setShowSetting] = useState(false);
	const [showGift, setShowGift] = useState(false);
	const [showTable, setShowTable] = useState(false);
	const [showGuests, setShowGuests] = useState(false);
	const [showMessages, setShowMessages] = useState(false);

	const deleteEvent = async (): Promise<void> => {
		try {
			const data = await eventService.delete(event.id);
			onChanged(getApiSuccessMessage(data, "Event dihapus"));
			onHide();
		} catch (error: unknown) {
			onError(getApiErrorMessage(error, "Gagal menghapus event"));
		}
	};

	const undanganCards: ManageCard[] = [
		{
			key: "wedding",
			icon: "pi pi-heart",
			title: "Data wedding",
			hint: "Mempelai dan detail pernikahan",
			onClick: () => setShowWedding(true),
		},
		{
			key: "location",
			icon: "pi pi-map-marker",
			title: "Lokasi",
			hint: "Tempat akad dan resepsi",
			onClick: () => setShowLocation(true),
		},
		{
			key: "photo",
			icon: "pi pi-image",
			title: "Foto",
			hint: "Galeri dan foto undangan",
			onClick: () => setShowPhoto(true),
		},
		{
			key: "gift",
			icon: "pi pi-gift",
			title: "Amplop digital",
			hint: "Rekening atau e-wallet tamu",
			onClick: () => setShowGift(true),
		},
		{
			key: "setting",
			icon: "pi pi-cog",
			title: "Setting",
			hint: "Fitur yang tampil di undangan",
			onClick: () => setShowSetting(true),
		},
	];

	const tamuCards: ManageCard[] = [
		{
			key: "guests",
			icon: "pi pi-id-card",
			title: "Tamu",
			hint: "Daftar tamu dan tautan undangan",
			onClick: () => setShowGuests(true),
		},
		{
			key: "table",
			icon: "pi pi-clone",
			title: "Meja",
			hint: "Denah dan penempatan tamu",
			onClick: () => setShowTable(true),
		},
		{
			key: "messages",
			icon: "pi pi-envelope",
			title: "Ucapan tamu",
			hint: "Tampil atau sembunyikan ucapan",
			onClick: () => setShowMessages(true),
		},
	];

	const hariHCards: ManageCard[] = [
		...(canMutate
			? [
					{
						key: "usher",
						icon: "pi pi-qrcode",
						title: "Wedding usher",
						hint: "Check-in dan stiker kado",
						onClick: () => window.open(`/events/${event.id}/usher`, "_blank"),
					} satisfies ManageCard,
				]
			: []),
		{
			key: "preview",
			icon: "pi pi-eye",
			title: "Preview",
			hint: "Lihat undangan seperti tamu",
			onClick: () => window.open(`/events/preview/${event.id}`, "_blank"),
		},
	];

	const adminCards: ManageCard[] = [
		...(canMutate
			? [
					{
						key: "edit",
						icon: "pi pi-pencil",
						title: "Edit event",
						hint: "Nama, tanggal, template, musik",
						onClick: () => setShowForm(true),
					} satisfies ManageCard,
				]
			: []),
		...(isAdmin
			? [
					{
						key: "assign",
						icon: "pi pi-users",
						title: "Assign panitia",
						hint: "Siapa yang bisa kelola event ini",
						onClick: () => setShowAssignment(true),
					} satisfies ManageCard,
					{
						key: "delete",
						icon: "pi pi-trash",
						title: "Hapus event",
						hint: "Hapus event secara permanen",
						danger: true,
						onClick: () =>
							confirmDialog({
								message: "Hapus event ini?",
								header: "Konfirmasi",
								accept: () => void deleteEvent(),
							}),
					} satisfies ManageCard,
				]
			: []),
	];

	const renderGroup = (title: string, cards: ManageCard[]): React.ReactNode => {
		if (cards.length === 0) {
			return null;
		}
		return (
			<section className="event-manage-group">
				<h3>{title}</h3>
				<div className="event-manage-grid">
					{cards.map((card) => (
						<button
							key={card.key}
							type="button"
							className={`event-manage-card${card.danger ? " danger" : ""}`}
							onClick={card.onClick}
						>
							<i className={card.icon} aria-hidden="true" />
							<strong>{card.title}</strong>
							<span>{card.hint}</span>
						</button>
					))}
				</div>
			</section>
		);
	};

	return (
		<>
			<Dialog
				header={`Kelola event — ${event.name}`}
				visible
				style={{ width: "94vw", maxWidth: "44rem" }}
				onHide={onHide}
				className="event-manage-dialog"
			>
				<p className="event-manage-meta">
					{new Date(event.date).toLocaleString("id-ID")}
					{event.templateName ? ` · ${event.templateName}` : ""}
				</p>
				{renderGroup("Undangan", undanganCards)}
				{renderGroup("Tamu", tamuCards)}
				{renderGroup("Hari-H", hariHCards)}
				{renderGroup("Admin", adminCards)}
			</Dialog>
			{showForm && (
				<EventForm
					event={event}
					onSuccess={(message) => {
						setShowForm(false);
						onChanged(message);
					}}
					onHide={() => setShowForm(false)}
				/>
			)}
			{showAssignment && (
				<EventAssignmentDialog
					event={event}
					visible={showAssignment}
					onHide={() => setShowAssignment(false)}
				/>
			)}
			{showWedding && (
				<WeddingForm
					event={event}
					onSuccess={(message) => {
						setShowWedding(false);
						onChanged(message);
					}}
					onHide={() => setShowWedding(false)}
				/>
			)}
			{showLocation && (
				<EventLocationDialog event={event} onHide={() => setShowLocation(false)} />
			)}
			{showPhoto && (
				<EventPhotoDialog event={event} onHide={() => setShowPhoto(false)} />
			)}
			{showSetting && (
				<EventSettingDialog event={event} onHide={() => setShowSetting(false)} />
			)}
			{showGift && <GiftDialog event={event} onHide={() => setShowGift(false)} />}
			{showTable && (
				<EventTableDialog event={event} onHide={() => setShowTable(false)} />
			)}
			{showGuests && <GuestDialog event={event} onHide={() => setShowGuests(false)} />}
			{showMessages && (
				<GuestMessageDialog event={event} onHide={() => setShowMessages(false)} />
			)}
		</>
	);
};

export default EventManageDialog;
