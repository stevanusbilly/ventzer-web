import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { guestService } from "../../services/guestService";
import { eventService } from "../../services/eventService";
import { Guest, Event, EventSummary } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { currentMonthRange, toDateQueryParams } from "../../utils/dateRange";

const emptySummary: EventSummary = {
	totalGuests: 0,
	pending: 0,
	accepted: 0,
	declined: 0,
	checkedIn: 0,
	eventCount: 0,
};

const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const [dateRange, setDateRange] = useState<(Date | null)[]>(currentMonthRange());
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

	const resetDashboard = (): void => {
		setEvents([]);
		setEventCount(0);
		setGuestCount(0);
		setCheckInCount(0);
		setRecentGuests([]);
		setSummary(null);
		applyChart(emptySummary);
	};

	const loadData = async (): Promise<void> => {
		const params = toDateQueryParams(dateRange);
		if (!params.dateFrom && !params.dateTo) {
			resetDashboard();
			return;
		}

		setLoading(true);
		setEvents([]);
		try {
			const eventList =
				user?.role === "admin"
					? await eventService.getAll(params)
					: await eventService.getByUser(user?.id || 0, params);
			setEvents(eventList);
			setEventCount(eventList.length);

			if (
				selectedEventId > 0 &&
				!eventList.some((event) => event.id === selectedEventId)
			) {
				setSelectedEventId(0);
				return;
			}

			const recapParams = {
				...params,
				...(selectedEventId > 0 ? { eventId: selectedEventId } : {}),
			};
			const recap = await eventService.getRecap(recapParams);
			setGuestCount(Number(recap.totalGuests) || 0);
			setCheckInCount(Number(recap.checkedIn) || 0);
			setEventCount(
				selectedEventId > 0 ? 1 : Number(recap.eventCount ?? eventList.length),
			);
			setSummary(recap);
			applyChart(recap);

			const guests = await guestService.getRecent(
				selectedEventId || undefined,
				10,
				params,
			);
			setRecentGuests(guests);
		} catch (error) {
			console.error("Error loading dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange, selectedEventId, user?.id, user?.role]);

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

	const eventOptions = events.map((event) => ({
		label: event.name,
		value: event.id,
	}));

	return (
		<div className="flex flex-column gap-4">
			<div className="flex justify-content-between align-items-end flex-wrap gap-3">
				<div>
					<h2 className="text-2xl font-bold text-900 m-0">Dashboard</h2>
					<p className="text-500 m-0 mt-1">Ringkasan RSVP dan check-in</p>
				</div>
				<div className="flex gap-2 align-items-end flex-wrap">
					<div className="flex flex-column gap-1">
						<label htmlFor="dashboardDateFilter" className="font-semibold">
							Tanggal event
						</label>
						<Calendar
							id="dashboardDateFilter"
							value={dateRange}
							onChange={(e) => {
								setSelectedEventId(0);
								setDateRange((e.value as (Date | null)[]) || [null, null]);
							}}
							selectionMode="range"
							readOnlyInput
							dateFormat="dd/mm/yy"
							placeholder="Dari — sampai"
							showButtonBar
							hideOnRangeSelection
							className="w-18rem"
						/>
					</div>
					<div className="flex flex-column gap-1">
						<label htmlFor="dashboardEventFilter" className="font-semibold">
							Event
						</label>
						<Dropdown
							inputId="dashboardEventFilter"
							value={selectedEventId}
							options={[
								{ label: "Semua event di rentang ini", value: 0 },
								...eventOptions,
							]}
							onChange={(e: DropdownChangeEvent) => setSelectedEventId(e.value)}
							placeholder={
								dateRange[0]
									? "Tidak ada event di rentang ini"
									: "Pilih rentang tanggal dulu"
							}
							disabled={!dateRange[0] || eventOptions.length === 0}
							className="w-18rem"
						/>
					</div>
					<Button
						icon="pi pi-refresh"
						label="Refresh"
						className="p-button-outlined p-button-sm"
						onClick={() => void loadData()}
						disabled={!dateRange[0]}
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
							emptyMessage={
								dateRange[0]
									? "Belum ada tamu pada rentang tanggal ini"
									: "Pilih rentang tanggal untuk menampilkan data"
							}
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
