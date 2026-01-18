<template>
	<div style="width: 100%; height: 100%; position: relative;">
		<canvas ref="chart" :style="{'height': height + 'px', 'width': '100%', 'display': 'block'}"></canvas>
	</div>
</template>

<script>
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	export default ({
		props: [
			'data',
			'height',
		],
		data(){
			return {
				chart: null,
			} ;
		},
		mounted () { 
			this.$nextTick(() => {
				this.createChart()
			})
		},
		methods: {
			createChart() {
				if (!this.$refs.chart) {
					console.warn('ChartBar - Canvas ref not available, retrying...')
					this.$nextTick(() => {
						this.createChart()
					})
					return
				}
				
				if (this.chart) {
					this.chart.destroy()
					this.chart = null
				}
				
				if (!this.data || !this.data.labels || !this.data.datasets) {
					console.warn('ChartBar - Invalid data, waiting for data...', this.data)
					return
				}
				
    			let ctx = this.$refs.chart.getContext("2d");
				console.log('ChartBar - Creating chart with data:', this.data)
				
				this.chart = new Chart(ctx, {
					type: "bar",
					data: this.data,
     				options: {
					layout: {
						padding: {
							top: 30,
							right: 15,
							left: 10,
							bottom: 5,
						},
					},
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false,
						},
					},
					tooltips: {
						enabled: true,
						mode: "index",
						intersect: false,
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								display: true,
								color: "rgba(255, 255, 255, .2)",
								zeroLineColor: "#ffffff",
								borderDash: [6],
								borderDashOffset: [6],
							},
							ticks: {
								beginAtZero: true,
								min: 0,
								stepSize: 1,
								display: true,
								color: "#fff",
								font: {
									size: 14,
									lineHeight: 1.5,
									weight: '600',
									family: "Open Sans",
								},
								callback: function(value) {
									return value;
								}
							},
						},
						x: {
							grid: {
								display: false,
							},
							ticks: {
								display: true,
								color: "#fff",
								font: {
									size: 14,
									lineHeight: 1.5,
									weight: '600',
									family: "Open Sans",
								},
							},
						},
					},
				}
			});
		},
	},
		watch: {
			data: {
				handler(newData) {
					console.log('ChartBar - Data changed:', newData)
					if (!newData || !newData.labels || !newData.datasets) {
						console.warn('ChartBar - Invalid data structure:', newData)
						return
					}
					
					if (this.chart) {
						console.log('ChartBar - Updating existing chart with new data')
						this.chart.data.labels = newData.labels
						this.chart.data.datasets = newData.datasets
						this.chart.update()
					} else {
						console.log('ChartBar - Chart not created yet, creating now')
						this.$nextTick(() => {
							this.createChart()
						})
					}
				},
				deep: true,
				immediate: false,
			},
		},
		// Right before the component is destroyed,
		// also destroy the chart.
		beforeDestroy: function () {
			if (this.chart) {
				this.chart.destroy() ;
			}
		},
	})

</script>

<style lang="scss" scoped>
	canvas {
		background-image: linear-gradient(to right, #00369E, #005CFD, #A18DFF ) ;
	}
</style>