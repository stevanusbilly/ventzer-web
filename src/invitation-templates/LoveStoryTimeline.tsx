import React from "react";
import { EventPhoto } from "../types";
import { getImageUrl, parseDate } from "./classic-tsx/utils";
import "./LoveStoryTimeline.css";

const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

const formatStoryDate = (value?: string | null): string => {
	const date = parseDate(value);
	if (!date) {
		return String(value || "");
	}
	return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const LoveStoryTimeline: React.FC<{ items: EventPhoto[] }> = ({ items }) => {
	const stories = [...items].sort(
		(a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.id - b.id,
	);
	if (stories.length === 0) {
		return null;
	}

	return (
		<section className="lst-section">
			<header className="lst-head">
				<span className="lst-rule" aria-hidden="true" />
				<h2>Love Story</h2>
				<span className="lst-rule" aria-hidden="true" />
			</header>
			<p className="lst-lead">A journey of two hearts, one beautiful story...</p>
			<div className="lst-track">
				{stories.map((item, index) => (
					<article
						key={item.id}
						className={`lst-item ${index % 2 === 1 ? "lst-item-alt" : ""}`}
					>
						<div className="lst-photo">
							{item.pathImage && (
								<img src={getImageUrl(item.pathImage)} alt={item.name} />
							)}
						</div>
						<div className="lst-copy">
							{item.date && (
								<p className="lst-date">
									<i className="pi pi-calendar" aria-hidden="true" />
									{formatStoryDate(item.date)}
								</p>
							)}
							<h3>{item.name}</h3>
							{item.keterangan && <p>{item.keterangan}</p>}
						</div>
					</article>
				))}
			</div>
		</section>
	);
};

export default LoveStoryTimeline;
