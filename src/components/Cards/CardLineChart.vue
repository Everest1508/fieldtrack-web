<template>

	<a-card :bordered="false" class="dashboard-bar-line header-solid">
		<template #title>
			<h6>Sales Overview</h6>			
			<p>Monthly visits and leads trend</p>	
		</template>
		<template #extra>
			<a-badge color="primary" class="badge-dot-primary" text="Visits" />
			<a-badge color="primary" class="badge-dot-secondary" text="Leads" />
		</template>
		<chart-line :key="chartKey" :height="310" :data="lineChartData"></chart-line>
	</a-card>

</template>

<script>

	// Bar chart for "Active Users" card.
	import ChartLine from '../Charts/ChartLine' ;

	export default ({
		components: {
			ChartLine,
		},
		props: {
			chartData: {
				type: Object,
				default: () => ({
					labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
					traffic: [0, 0, 0, 0, 0, 0, 0, 0, 0],
					sales: [0, 0, 0, 0, 0, 0, 0, 0, 0],
				}),
			},
		},
		data() {
			return {
				chartKey: 0,
			}
		},
		watch: {
			chartData: {
				handler() {
					// Force chart to re-render when data changes
					this.chartKey += 1
				},
				deep: true,
			},
		},
		computed: {
			lineChartData() {
				const labels = this.chartData.labels || ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
				const traffic = this.chartData.traffic || [0, 0, 0, 0, 0, 0, 0, 0, 0]
				const sales = this.chartData.sales || [0, 0, 0, 0, 0, 0, 0, 0, 0]
				console.log('CardLineChart - lineChartData computed:', { labels, traffic, sales })
				return {
					labels: labels,
					datasets: [{
						label: "Traffic",
						tension: 0.4,
						borderWidth: 0,
						pointRadius: 0,
						borderColor: "#1890FF",
						borderWidth: 3,
						data: traffic,
						maxBarThickness: 6
					},
					{
						label: "Sales",
						tension: 0.4,
						borderWidth: 0,
						pointRadius: 0,
						borderColor: "#B37FEB",
						borderWidth: 3,
						data: sales,
						maxBarThickness: 6
					}],
				}
			},
		},
	})

</script>