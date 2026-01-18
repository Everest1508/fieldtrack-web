	<template>

	<!-- Weekly Visits Card -->
	<a-card :bordered="false" class="dashboard-bar-chart">
		<div class="card-title">
			<h6>Weekly Visits</h6>
			<p>Field visits overview for the last 7 days</p>
		</div>
		<div style="margin-top: 24px;">
			<chart-bar v-if="barChartData && barChartData.labels && barChartData.datasets" :key="chartKey" :height="220" :data="barChartData"></chart-bar>
			<div v-else style="height: 220px; display: flex; align-items: center; justify-content: center;">
				<a-spin />
			</div>
		</div>
	</a-card>
	<!-- Weekly Visits Card -->

</template>

<script>

	// Bar chart for "Active Users" card.
	import ChartBar from '../Charts/ChartBar' ;

	export default ({
		components: {
			ChartBar,
		},
		props: {
			chartData: {
				type: Object,
				default: () => ({
					labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
					data: [0, 0, 0, 0, 0, 0, 0],
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
			barChartData() {
				const data = this.chartData.data || [0, 0, 0, 0, 0, 0, 0]
				const labels = this.chartData.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
				console.log('CardBarChart - barChartData computed:', { labels, data, sum: data.reduce((a, b) => a + b, 0) })
				
				// Ensure we have valid data
				if (!Array.isArray(data) || data.length === 0) {
					console.warn('CardBarChart - Invalid data, using defaults')
					return {
						labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
						datasets: [{
							label: "Visits",
							backgroundColor: '#fff',
							borderWidth: 0,
							borderSkipped: false,
							borderRadius: 6,
							data: [0, 0, 0, 0, 0, 0, 0],
							maxBarThickness: 20,
						}],
					}
				}
				
				const chartData = {
					labels: labels,
					datasets: [{
						label: "Visits",
						backgroundColor: '#fff',
						borderWidth: 0,
						borderSkipped: false,
						borderRadius: 6,
						data: data,
						maxBarThickness: 20,
						minBarLength: 2, // Minimum bar length to ensure visibility
					}],
				}
				
				console.log('CardBarChart - Final chart data:', JSON.stringify(chartData))
				return chartData
			},
		},
	})

</script>