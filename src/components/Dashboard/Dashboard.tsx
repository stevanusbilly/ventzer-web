import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { checkinService } from "../../services/checkinService";
import { Guest, Event, EventSummary } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const [guestCount, setGuestCount] = useState(0);
	const [eventCount, setEventCount] = useState(0);
	const [checkInCount, setCheckInCount] = useState(0);
	const [events, setEvents] = useState<Event[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<number>(0);
	const [summary, setSummary] = useState<EventSummary | null>(null);
	const [chartData, setChartData] = useState<Record<string, unknown>>({});
	const [chartOptions, setChartOptions] = useState<Record<string, unknown>>({});
	const [recentGuests, setRecentGuests] = useState<Guest[]>([]);
	const [loading, setLoading] = useState(false);

	const applyChart = (s: Partial<EventSummary>) => {
		const pending = Number(s.pending) || 0;
		const accepted = Number(s.accepted) || 0;
		const declined = Number(s.declined) || 0;
		setChartData({
			labels: ["Accepted", "Pending", "Declined"],
			datasets: [
				{
					data: [accepted, pending, declined],
					backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
					hoverBackgroundColor: ["#16a34a", "#ca8a04", "#dc2626"],
					borderWidth: 2,
					borderColor: "#ffffff",
				},
			],
		});
		setChartOptions({
			plugins: { legend: { position: "bottom" } },
			maintainAspectRatio: false,
			responsive: true,
		});
	};

	const loadData = async (): Promise<void> => {
		setLoading(true);
		try {
			let eventList: Event[] = [];
			if (user?.role === "admin") {
				eventList = await eventService.getAll();
			} else if (user?.id) {
				eventList = await eventService.getByUser(user.id);
			}
			setEvents(eventList);
			setEventCount(eventList.length);

			const eventFilter = selectedEventId || undefined;
			const [guestCountRes, checkinCountRes, guests] = await Promise.all([
				guestService.getCount(eventFilter),
				checkinService.getCount(eventFilter),
				guestService.getRecent(eventFilter, 10),
			]);

			setGuestCount(guestCountRes.count);
			setCheckInCount(checkinCountRes.count);
			setRecentGuests(guests);

			if (selectedEventId > 0) {
				const eventSummary = await eventService.getSummary(selectedEventId);
				setSummary(eventSummary);
				applyChart(eventSummary);
			} else if (eventList.length > 0) {
				const eventSummary = await eventService.getSummary(eventList[0].id);
				setSummary(eventSummary);
				applyChart(eventSummary);
			} else {
				setSummary(null);
				applyChart({
					totalGuests: 0,
					pending: 0,
					accepted: 0,
					declined: 0,
					checkedIn: 0,
				});
			}
		} catch (error) {
			console.error("Error loading dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedEventId, user?.id]);

	const statusBodyTemplate = (rowData: Guest): React.ReactNode => {
		const severity = {
			accepted: "success",
			pending: "warning",
			declined: "danger",
		}[rowData.rsvpStatus] as "success" | "warning" | "danger";

		return <Tag value={rowData.rsvpStatus} severity={severity} />;
	};

	const checkInTemplate = (rowData: Guest): string =>
		rowData.checkedIn
			? new Date(rowData.checkedIn).toLocaleString("id-ID")
			: "Belum check-in";

	return (
		<div className="flex flex-column gap-4">
			<div className="flex justify-content-between align-items-center flex-wrap gap-2">
				<div>
					<h2 className="text-2xl font-bold text-900 m-0">Dashboard</h2>
					<p className="text-500 m-0 mt-1">Ringkasan RSVP dan check-in</p>
				</div>
				<div className="flex gap-2 align-items-center">
					<Dropdown
						value={selectedEventId}
						options={[
							{ label: "Semua event", value: 0 },
							...events.map((e) => ({ label: e.name, value: e.id })),
						]}
						onChange={(e: DropdownChangeEvent) => setSelectedEventId(e.value)}
						placeholder="Filter event"
						className="w-14rem"
					/>
					<Button
						icon="pi pi-refresh"
						label="Refresh"
						className="p-button-outlined p-button-sm"
						onClick={loadData}
					/>
				</div>
			</div>

			<div className="grid">
				<div className="col-12 md:col-4">
					<div className="surface-card shadow-2 p-3 border-round border-left-3 border-blue-500">
						<span className="text-500">Total Tamu</span>
						<div className="text-3xl font-bold">{guestCount}</div>
					</div>
				</div>
				<div className="col-12 md:col-4">
					<div className="surface-card shadow-2 p-3 border-round border-left-3 border-green-500">
						<span className="text-500">Total Event</span>
						<div className="text-3xl font-bold">{eventCount}</div>
					</div>
				</div>
				<div className="col-12 md:col-4">
					<div className="surface-card shadow-2 p-3 border-round border-left-3 border-purple-500">
						<span className="text-500">Sudah Check-in</span>
						<div className="text-3xl font-bold">{checkInCount}</div>
					</div>
				</div>
			</div>

			<div className="grid">
				<div className="col-12 md:col-5">
					<Card title="Rekap RSVP" className="shadow-2 h-full">
						{summary && (
							<ul className="list-none p-0 m-0 mb-3 line-height-3">
								<li>Pending: {summary.pending}</li>
								<li>Accepted: {summary.accepted}</li>
								<li>Declined: {summary.declined}</li>
								<li>Check-in: {summary.checkedIn}</li>
							</ul>
						)}
						<div style={{ height: "220px" }}>
							<Chart type="pie" data={chartData} options={chartOptions} />
						</div>
					</Card>
				</div>
				<div className="col-12 md:col-7">
					<Card title="Tamu Terbaru" className="shadow-2 h-full">
						<DataTable
							value={recentGuests}
							loading={loading}
							emptyMessage="Belum ada tamu"
						>
							<Column field="name" header="Nama" />
							<Column field="eventName" header="Event" />
							<Column field="rsvpStatus" header="RSVP" body={statusBodyTemplate} />
							<Column header="Check-in" body={checkInTemplate} />
						</DataTable>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
