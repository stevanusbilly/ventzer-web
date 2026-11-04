import React from "react";

const Rose: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 1 }) => (
	<g transform={`translate(${x} ${y}) scale(${size})`}>
		<circle r="22" fill="#f7f1ea" />
		<circle r="16" fill="#f0e4d8" />
		<circle cx="-5" cy="-3" r="10" fill="#f8f3ee" />
		<circle cx="6" cy="2" r="9" fill="#ead7c8" />
		<circle r="5" fill="#e2c4b0" />
	</g>
);

const Leaf: React.FC<{ x: number; y: number; rotate?: number; wide?: boolean }> = ({
	x,
	y,
	rotate = 0,
	wide = false,
}) => (
	<ellipse
		cx={x}
		cy={y}
		rx={wide ? 30 : 22}
		ry={wide ? 11 : 8}
		fill={wide ? "#cdd8bc" : "#b7c6a5"}
		transform={`rotate(${rotate} ${x} ${y})`}
	/>
);

const UsherFlorals: React.FC = () => (
	<>
		<svg className="usher-floral usher-floral-tl" viewBox="0 0 340 260" fill="none" aria-hidden="true">
			<path d="M24 168c42-54 92-86 148-98" stroke="#7f916b" strokeWidth="3" strokeLinecap="round" />
			<path d="M48 210c48-40 108-66 168-70" stroke="#93a57d" strokeWidth="2.4" strokeLinecap="round" />
			<Leaf x={86} y={72} rotate={-34} wide />
			<Leaf x={138} y={48} rotate={12} wide />
			<Leaf x={188} y={78} rotate={-8} />
			<Leaf x={58} y={118} rotate={-18} />
			<Rose x={92} y={108} size={1.05} />
			<Rose x={142} y={86} size={1.2} />
			<Rose x={186} y={114} size={0.9} />
			<Rose x={228} y={62} size={0.72} />
			<circle cx="64" cy="148" r="7" fill="#f3ebe3" />
			<circle cx="248" cy="98" r="6" fill="#efe4d8" />
		</svg>
		<svg className="usher-floral usher-floral-tr" viewBox="0 0 300 220" fill="none" aria-hidden="true">
			<Leaf x={210} y={48} rotate={28} wide />
			<Leaf x={168} y={36} rotate={-16} />
			<Leaf x={236} y={86} rotate={12} />
			<Rose x={198} y={72} size={1} />
			<Rose x={154} y={58} size={0.7} />
			<circle cx="248" cy="58" r="6" fill="#f4eee6" />
		</svg>
		<svg className="usher-floral usher-floral-bl" viewBox="0 0 260 200" fill="none" aria-hidden="true">
			<path d="M18 172c30-52 72-84 122-98" stroke="#7d8f6a" strokeWidth="2.6" strokeLinecap="round" />
			<Leaf x={72} y={96} rotate={-28} wide />
			<Leaf x={112} y={78} rotate={18} />
			<Leaf x={48} y={132} rotate={-12} />
			<Rose x={148} y={92} size={0.62} />
			<circle cx="176" cy="114" r="6" fill="#f1e7dc" />
		</svg>
	</>
);

export default UsherFlorals;
