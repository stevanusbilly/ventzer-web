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
		fill={wide ? "#dce6cc" : "#c5d4b0"}
		transform={`rotate(${rotate} ${x} ${y})`}
	/>
);

const LoginFlorals: React.FC = () => (
	<>
		<svg className="login-floral login-floral-tl" viewBox="0 0 340 260" fill="none" aria-hidden="true">
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
		</svg>
		<svg className="login-floral login-floral-br" viewBox="0 0 300 240" fill="none" aria-hidden="true">
			<path d="M276 52c-48 42-92 70-150 86" stroke="#7f916b" strokeWidth="2.6" strokeLinecap="round" />
			<Leaf x={168} y={148} rotate={22} wide />
			<Leaf x={214} y={168} rotate={-18} />
			<Leaf x={128} y={176} rotate={12} />
			<Rose x={188} y={164} size={1.05} />
			<Rose x={236} y={142} size={0.78} />
			<circle cx="112" cy="154" r="6" fill="#f1e7dc" />
		</svg>
	</>
);

export default LoginFlorals;
