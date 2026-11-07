import React, { useState, useEffect } from "react";
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
import "./Dashboard.css";

const emptySummary: EventSummary = {
	totalGuests: 0,
	pending: 0,
	accepted: 0,
	declined: 0,
	checkedIn: 0,
	eventCount: 0,
};

const RSVP_COLORS = {
	accepted: "#1769f5",
	pending: "#f5b83d",
	declined: "#e5484d",
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
		const empty = pending + accepted + declined === 0;
		setChartData({
			labels: ["Accepted", "Pending", "Declined"],
			datasets: [
				{
					data: empty ? [1] : [accepted, pending, declined],
					backgroundColor: empty
						? ["#e6ebf7"]
						: [RSVP_COLORS.accepted, RSVP_COLORS.pending, RSVP_COLORS.declined],
					hoverBackgroundColor: empty
						? ["#e6ebf7"]
						: ["#1257cf", "#e0a420", "#cc2f34"],
					borderWidth: 3,
					borderColor: "#ffffff",
				},
			],
		});
		setChartOptions({
			cutout: "68%",
			plugins: { legend: { display: false }, tooltip: { enabled: !empty } },
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

	const firstName = (user?.name || "").trim().split(/\s+/)[0] || "";
	const accepted = Number(summary?.accepted) || 0;
	const pending = Number(summary?.pending) || 0;
	const declined = Number(summary?.declined) || 0;

	const stats = [
		{ label: "Total Tamu", value: guestCount, icon: "pi pi-users", tone: "blue" },
		{ label: "Total Event", value: eventCount, icon: "pi pi-calendar", tone: "purple" },
		{ label: "RSVP Diterima", value: accepted, icon: "pi pi-check-circle", tone: "green" },
		{ label: "Sudah Check-in", value: checkInCount, icon: "pi pi-qrcode", tone: "navy" },
	];

	const legend = [
		{ label: "Diterima", value: accepted, color: RSVP_COLORS.accepted },
		{ label: "Menunggu", value: pending, color: RSVP_COLORS.pending },
		{ label: "Ditolak", value: declined, color: RSVP_COLORS.declined },
	];

	return (
		<div className="vz-dash">
			<section className="vz-hero">
				<div className="vz-hero-copy">
					<span className="vz-hero-eyebrow">Ringkasan</span>
					<h1>{firstName ? `Halo, ${firstName}` : "Dashboard"}</h1>
					<p>Pantau RSVP, tamu, dan check-in event kamu dalam satu tempat.</p>
				</div>
				<div className="vz-hero-filters">
					<div className="vz-field">
						<label htmlFor="dashboardDateFilter">Tanggal event</label>
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
							showIcon
						/>
					</div>
					<div className="vz-field">
						<label htmlFor="dashboardEventFilter">Event</label>
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
						/>
					</div>
					<Button
						icon="pi pi-refresh"
						label="Refresh"
						className="vz-refresh"
						onClick={() => void loadData()}
						disabled={!dateRange[0]}
					/>
				</div>
			</section>

			<section className="vz-stats">
				{stats.map((stat) => (
					<article key={stat.label} className={`vz-stat vz-stat-${stat.tone}`}>
						<span className="vz-stat-icon">
							<i className={stat.icon} />
						</span>
						<div>
							<span className="vz-stat-label">{stat.label}</span>
							<strong className="vz-stat-value">{stat.value}</strong>
						</div>
					</article>
				))}
			</section>

			<section className="vz-grid">
				<article className="vz-panel vz-panel-rsvp">
					<header>
						<h2>Rekap RSVP</h2>
						<span>{accepted + pending + declined} respons</span>
					</header>
					<div className="vz-chart">
						<Chart type="doughnut" data={chartData} options={chartOptions} />
						<div className="vz-chart-center">
							<strong>{guestCount}</strong>
							<span>tamu</span>
						</div>
					</div>
					<ul className="vz-legend">
						{legend.map((item) => (
							<li key={item.label}>
								<i style={{ background: item.color }} />
								<span>{item.label}</span>
								<strong>{item.value}</strong>
							</li>
						))}
					</ul>
				</article>

				<article className="vz-panel vz-panel-guests">
					<header>
						<h2>Tamu Terbaru</h2>
						<span>10 terakhir</span>
					</header>
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
				</article>
			</section>
		</div>
	);
};

export default Dashboard;
