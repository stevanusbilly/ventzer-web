import './Statistics.css';

const statistics = [
	{
		value: '1.200+',
		title: 'Wedding Event',
	},
	{
		value: '350K+',
		title: 'Guest Invitation',
	},
	{
		value: '98%',
		title: 'Client Satisfaction',
	},
	{
		value: '24/7',
		title: 'Support',
	},
];

const Statistics = () => {
	return (
		<section className='landing-statistics'>
			<div className='landing-statistics__container'>
				{statistics.map((item) => (
					<div className='statistics-card' key={item.title}>
						<h2>{item.value}</h2>
						<p>{item.title}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default Statistics;
