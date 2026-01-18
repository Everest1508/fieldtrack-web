<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Reports & Analytics</h6>
				<p>Generate custom reports with filters and analytics</p>
			</template>
			<template #extra>
				<a-button type="primary" @click="showFilterDrawer">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4V6C2 6.55228 2.44772 7 3 7H17C17.5523 7 18 6.55228 18 6V4C18 3.44772 17.5523 3 17 3H3ZM3 9C2.44772 9 2 9.44772 2 10V12C2 12.5523 2.44772 13 3 13H17C17.5523 13 18 12.5523 18 12V10C18 9.44772 17.5523 9 17 9H3ZM3 15C2.44772 15 2 15.4477 2 16V18C2 18.5523 2.44772 19 3 19H17C17.5523 19 18 18.5523 18 18V16C18 15.4477 17.5523 15 17 15H3Z" fill="white"/>
					</svg>
					Custom Report
				</a-button>
			</template>
		</a-card>

		<!-- Filter Drawer -->
		<a-drawer
			title="Generate Custom Report"
			:visible="filterDrawerVisible"
			:width="400"
			@close="closeFilterDrawer"
		>
			<a-form :form="filterForm" layout="vertical">
				<a-form-item label="Report Type">
					<a-select
						v-decorator="['report_type', { initialValue: 'combined' }]"
						placeholder="Select report type"
					>
						<a-select-option value="visits">Field Visits</a-select-option>
						<a-select-option value="leads">Leads</a-select-option>
						<a-select-option value="performance">Performance</a-select-option>
						<a-select-option value="combined">Combined Report</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="Date Range">
					<a-range-picker
						v-decorator="['date_range', { rules: [{ required: true, message: 'Please select date range' }] }]"
						style="width: 100%"
						:placeholder="['Start Date', 'End Date']"
					/>
				</a-form-item>

				<a-form-item label="Sales Executives">
					<a-select
						v-decorator="['executive_ids']"
						mode="multiple"
						placeholder="Select executives (leave empty for all)"
						:loading="loadingExecutives"
					>
						<a-select-option v-for="exec in executives" :key="exec.id" :value="exec.id">
							{{ exec.first_name }} {{ exec.last_name }}
						</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item label="Customers">
					<a-select
						v-decorator="['customer_ids']"
						mode="multiple"
						placeholder="Select customers (leave empty for all)"
						:loading="loadingCustomers"
						:filter-option="filterCustomerOption"
						show-search
					>
						<a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
							{{ customer.name }} - {{ customer.company || 'N/A' }}
						</a-select-option>
					</a-select>
				</a-form-item>

				<a-form-item>
					<a-button type="primary" block @click="generateReport" :loading="generatingReport">
						Generate Report
					</a-button>
				</a-form-item>
			</a-form>
		</a-drawer>

		<!-- Report Results -->
		<div v-if="reportData">
			<!-- Summary Cards -->
			<a-row :gutter="24" class="mb-24">
				<a-col :span="24" :lg="6" v-for="(stat, index) in summaryStats" :key="index" class="mb-24">
					<a-card :bordered="false">
						<div style="display: flex; align-items: center; justify-content: space-between;">
							<div>
								<p class="text-muted mb-0" style="font-size: 14px;">{{ stat.title }}</p>
								<h3 class="mb-0" style="font-weight: 600;">{{ stat.value }}</h3>
							</div>
							<div style="font-size: 32px;">{{ stat.icon }}</div>
						</div>
					</a-card>
				</a-col>
			</a-row>

			<!-- Charts -->
			<a-row :gutter="24" class="mb-24" v-if="reportData.charts && Object.keys(reportData.charts).length > 0">
				<a-col :span="24" :lg="12" v-for="(chart, chartKey) in reportData.charts" :key="chartKey" class="mb-24">
					<a-card :bordered="false">
						<template #title>
							<h6>{{ getChartTitle(chartKey) }}</h6>
						</template>
						<chart-bar v-if="chartKey.includes('status') || chartKey.includes('executive')" :height="300" :data="formatChartData(chart, chartKey)"></chart-bar>
						<chart-line v-else :height="300" :data="formatChartData(chart, chartKey)"></chart-line>
					</a-card>
				</a-col>
			</a-row>

			<!-- Export Buttons -->
			<a-card :bordered="false" class="mb-24">
				<template #title>
					<h6>Export Report</h6>
				</template>
				<a-space>
					<a-button @click="exportReport('excel')" :loading="exporting">
						<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
							<path d="M3 3C2.44772 3 2 3.44772 2 4V16C2 16.5523 2.44772 17 3 17H17C17.5523 17 18 16.5523 18 16V4C18 3.44772 17.5523 3 17 3H3ZM4 5H16V15H4V5ZM6 7V9H14V7H6ZM6 10V12H14V10H6Z" fill="currentColor"/>
						</svg>
						Export to Excel
					</a-button>
					<a-button @click="exportReport('pdf')" :loading="exporting">
						<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
							<path d="M4 2C3.44772 2 3 2.44772 3 3V17C3 17.5523 3.44772 18 4 18H16C16.5523 18 17 17.5523 17 17V7L11 1H4ZM4 4H10V8H14V16H4V4Z" fill="currentColor"/>
						</svg>
						Export to PDF
					</a-button>
				</a-space>
			</a-card>

			<!-- Data Tables -->
			<a-card :bordered="false" v-if="reportData.data.visits && reportData.data.visits.length > 0">
				<template #title>
					<h6>Field Visits ({{ reportData.data.visits.length }})</h6>
				</template>
				<a-table
					:columns="visitColumns"
					:data-source="reportData.data.visits"
					:pagination="{ pageSize: 10 }"
				>
					<template slot="customer" slot-scope="text, record">
						{{ record.customer_name }}
					</template>
					<template slot="sales_executive" slot-scope="text, record">
						{{ record.sales_executive_name || '-' }}
					</template>
					<template slot="visit_date" slot-scope="date">
						{{ formatDate(date) }}
					</template>
					<template slot="discussion_status" slot-scope="status">
						<a-tag :color="getStatusColor(status)">
							{{ status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No Status' }}
						</a-tag>
					</template>
				</a-table>
			</a-card>

			<a-card :bordered="false" class="mt-24" v-if="reportData.data.leads && reportData.data.leads.length > 0">
				<template #title>
					<h6>Leads ({{ reportData.data.leads.length }})</h6>
				</template>
				<a-table
					:columns="leadColumns"
					:data-source="reportData.data.leads"
					:pagination="{ pageSize: 10 }"
				>
					<template slot="customer" slot-scope="text, record">
						{{ record.customer_name }}
					</template>
					<template slot="sales_executive" slot-scope="text, record">
						{{ record.sales_executive_name || '-' }}
					</template>
					<template slot="status" slot-scope="status">
						<a-tag :color="getStatusColor(status)">
							{{ status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
						</a-tag>
					</template>
					<template slot="created_at" slot-scope="date">
						{{ formatDate(date) }}
					</template>
				</a-table>
			</a-card>

			<a-card :bordered="false" class="mt-24" v-if="reportData.data.performance && reportData.data.performance.length > 0">
				<template #title>
					<h6>Performance Metrics</h6>
				</template>
				<a-table
					:columns="performanceColumns"
					:data-source="reportData.data.performance"
					:pagination="false"
				>
					<template slot="conversion_rate" slot-scope="rate">
						<a-progress :percent="rate" :status="rate >= 50 ? 'success' : rate >= 30 ? 'active' : 'exception'" />
					</template>
				</a-table>
			</a-card>
		</div>

		<!-- Default View (when no custom report) -->
		<div v-else>
			<a-row :gutter="24" class="mb-24">
				<a-col :span="24" :lg="12" class="mb-24">
					<a-card :bordered="false" title="Lead Status Distribution">
						<chart-bar :height="300" :data="leadStatusChartData"></chart-bar>
					</a-card>
				</a-col>
				<a-col :span="24" :lg="12" class="mb-24">
					<a-card :bordered="false" title="Weekly Visits">
						<chart-line :height="300" :data="visitsChartData"></chart-line>
					</a-card>
				</a-col>
			</a-row>

			<a-card :bordered="false">
				<template #title>
					<h6>Executive Performance</h6>
				</template>
				<a-table
					:columns="columns"
					:data-source="executives"
					:loading="loading"
					:pagination="false"
				>
					<template slot="name" slot-scope="text, record">
						{{ record.first_name }} {{ record.last_name }}
					</template>
					<template slot="conversion_rate" slot-scope="rate">
						<a-progress :percent="rate" :status="rate >= 50 ? 'success' : rate >= 30 ? 'active' : 'exception'" />
					</template>
				</a-table>
			</a-card>
		</div>
	</div>
</template>

<script>
	import { dashboardAPI, crmAPI } from '../services/api'
	import ChartBar from '../components/Charts/ChartBar'
	import ChartLine from '../components/Charts/ChartLine'

	export default {
		components: {
			ChartBar,
			ChartLine,
		},
		data() {
			return {
				executives: [],
				customers: [],
				loading: false,
				loadingExecutives: false,
				loadingCustomers: false,
				filterDrawerVisible: false,
				generatingReport: false,
				exporting: false,
				reportData: null,
				filterForm: this.$form.createForm(this),
				leadStatusChartData: {
					labels: [],
					data: [],
				},
				visitsChartData: {
					labels: [],
					data: [],
				},
				columns: [
					{
						title: 'Name',
						dataIndex: 'name',
						scopedSlots: { customRender: 'name' },
					},
					{
						title: 'Total Visits',
						dataIndex: 'stats.total_visits',
					},
					{
						title: 'Total Leads',
						dataIndex: 'stats.total_leads',
					},
					{
						title: 'Closed Deals',
						dataIndex: 'stats.closed_deals',
					},
					{
						title: 'Conversion Rate',
						dataIndex: 'stats.conversion_rate',
						scopedSlots: { customRender: 'conversion_rate' },
					},
				],
				visitColumns: [
					{
						title: 'Customer',
						dataIndex: 'customer',
						scopedSlots: { customRender: 'customer' },
					},
					{
						title: 'Sales Executive',
						dataIndex: 'sales_executive',
						scopedSlots: { customRender: 'sales_executive' },
					},
					{
						title: 'Visit Date',
						dataIndex: 'visit_date',
						scopedSlots: { customRender: 'visit_date' },
					},
					{
						title: 'Purpose',
						dataIndex: 'purpose',
						ellipsis: true,
					},
					{
						title: 'Status',
						dataIndex: 'discussion_status',
						scopedSlots: { customRender: 'discussion_status' },
					},
				],
				leadColumns: [
					{
						title: 'Customer',
						dataIndex: 'customer',
						scopedSlots: { customRender: 'customer' },
					},
					{
						title: 'Sales Executive',
						dataIndex: 'sales_executive',
						scopedSlots: { customRender: 'sales_executive' },
					},
					{
						title: 'Status',
						dataIndex: 'status',
						scopedSlots: { customRender: 'status' },
					},
					{
						title: 'Created At',
						dataIndex: 'created_at',
						scopedSlots: { customRender: 'created_at' },
					},
				],
				performanceColumns: [
					{
						title: 'Executive',
						dataIndex: 'executive_name',
					},
					{
						title: 'Total Visits',
						dataIndex: 'total_visits',
					},
					{
						title: 'Total Leads',
						dataIndex: 'total_leads',
					},
					{
						title: 'Closed Deals',
						dataIndex: 'closed_deals',
					},
					{
						title: 'Conversion Rate',
						dataIndex: 'conversion_rate',
						scopedSlots: { customRender: 'conversion_rate' },
					},
				],
			}
		},
		computed: {
			summaryStats() {
				if (!this.reportData || !this.reportData.summary) return []
				
				const summary = this.reportData.summary
				const stats = []
				
				if (summary.total_visits !== undefined) {
					stats.push({
						title: 'Total Visits',
						value: summary.total_visits,
						icon: '📍',
					})
				}
				
				if (summary.total_leads !== undefined) {
					stats.push({
						title: 'Total Leads',
						value: summary.total_leads,
						icon: '📈',
					})
				}
				
				if (summary.closed_deals !== undefined) {
					stats.push({
						title: 'Closed Deals',
						value: summary.closed_deals,
						icon: '✅',
					})
				}
				
				if (summary.conversion_rate !== undefined) {
					stats.push({
						title: 'Conversion Rate',
						value: `${summary.conversion_rate}%`,
						icon: '📊',
					})
				}
				
				if (summary.unique_customers !== undefined) {
					stats.push({
						title: 'Unique Customers',
						value: summary.unique_customers,
						icon: '👥',
					})
				}
				
				return stats
			},
		},
		mounted() {
			this.loadReports()
			this.loadExecutives()
			this.loadCustomers()
		},
		methods: {
			async loadReports() {
				this.loading = true
				try {
					// Load executives
					const executivesResponse = await dashboardAPI.getExecutives()
					if (executivesResponse.data && executivesResponse.data.data) {
						this.executives = executivesResponse.data.data.map(exec => ({
							...exec,
							name: `${exec.first_name} ${exec.last_name}`,
						}))
					}

					// Load lead status chart
					const leadsChartResponse = await dashboardAPI.getChartsData('leads')
					if (leadsChartResponse.data) {
						this.leadStatusChartData = {
							labels: leadsChartResponse.data.labels || [],
							datasets: [{
								label: 'Leads',
								backgroundColor: '#fff',
								borderWidth: 0,
								borderSkipped: false,
								borderRadius: 6,
								data: leadsChartResponse.data.data || [],
								maxBarThickness: 20,
							}],
						}
					}

					// Load visits chart
					const visitsChartResponse = await dashboardAPI.getChartsData('visits')
					if (visitsChartResponse.data) {
						this.visitsChartData = {
							labels: visitsChartResponse.data.labels || [],
							datasets: [{
								label: 'Visits',
								tension: 0.4,
								borderWidth: 0,
								pointRadius: 0,
								borderColor: '#1890FF',
								borderWidth: 3,
								data: visitsChartResponse.data.data || [],
								maxBarThickness: 6,
							}],
						}
					}
				} catch (error) {
					console.error('Error loading reports:', error)
					this.$message.error('Failed to load reports')
				} finally {
					this.loading = false
				}
			},
			async loadExecutives() {
				this.loadingExecutives = true
				try {
					const response = await dashboardAPI.getExecutives()
					if (response.data && response.data.data) {
						this.executives = response.data.data
					}
				} catch (error) {
					console.error('Error loading executives:', error)
				} finally {
					this.loadingExecutives = false
				}
			},
			async loadCustomers() {
				this.loadingCustomers = true
				try {
					const response = await crmAPI.getCustomers({ page_size: 1000 })
					if (response.data) {
						this.customers = response.data.results || response.data.data || response.data || []
					}
				} catch (error) {
					console.error('Error loading customers:', error)
					this.$message.error('Failed to load customers')
				} finally {
					this.loadingCustomers = false
				}
			},
			showFilterDrawer() {
				this.filterDrawerVisible = true
			},
			closeFilterDrawer() {
				this.filterDrawerVisible = false
			},
			filterCustomerOption(input, option) {
				return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
			},
			async generateReport() {
				this.filterForm.validateFields(async (err, values) => {
					if (!err) {
						this.generatingReport = true
						try {
							const filters = {
								report_type: values.report_type || 'combined',
								date_from: values.date_range ? values.date_range[0].format('YYYY-MM-DD') : null,
								date_to: values.date_range ? values.date_range[1].format('YYYY-MM-DD') : null,
								executive_ids: values.executive_ids || [],
								customer_ids: values.customer_ids || [],
								include_charts: true,
							}
							
							const response = await dashboardAPI.getCustomReport(filters)
							if (response.data) {
								this.reportData = response.data
								// Store filters for export
								this.reportData.filters = filters
								this.filterDrawerVisible = false
								this.$message.success('Report generated successfully!')
							}
						} catch (error) {
							console.error('Error generating report:', error)
							this.$message.error('Failed to generate report')
						} finally {
							this.generatingReport = false
						}
					}
				})
			},
			formatChartData(chart, chartKey) {
				if (chartKey === 'performance_comparison') {
					return {
						labels: chart.labels,
						datasets: [
							{
								label: 'Visits',
								backgroundColor: '#1890FF',
								borderWidth: 0,
								data: chart.visits,
							},
							{
								label: 'Leads',
								backgroundColor: '#52C41A',
								borderWidth: 0,
								data: chart.leads,
							},
							{
								label: 'Closed Deals',
								backgroundColor: '#722ED1',
								borderWidth: 0,
								data: chart.closed_deals,
							},
						],
					}
				}
				
				return {
					labels: chart.labels || [],
					datasets: [{
						label: chartKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
						backgroundColor: chartKey.includes('status') ? '#1890FF' : '#fff',
						borderColor: '#1890FF',
						borderWidth: chartKey.includes('status') ? 0 : 3,
						tension: chartKey.includes('daily') ? 0.4 : 0,
						pointRadius: chartKey.includes('daily') ? 0 : 3,
						data: chart.data || [],
						maxBarThickness: chartKey.includes('status') ? 20 : 6,
					}],
				}
			},
			getChartTitle(chartKey) {
				const titles = {
					'daily_visits': 'Daily Visits',
					'visits_by_executive': 'Visits by Executive',
					'leads_by_status': 'Leads by Status',
					'daily_leads': 'Daily Leads',
					'performance_comparison': 'Performance Comparison',
				}
				return titles[chartKey] || chartKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
			},
			getStatusColor(status) {
				if (!status) return 'default'
				const colors = {
					'interested': 'green',
					'quotation_requested': 'blue',
					'follow_up_required': 'orange',
					'negotiation_ongoing': 'purple',
					'not_interested': 'red',
					'deal_closed': 'green',
					'deal_lost': 'red',
				}
				return colors[status] || 'geekblue'
			},
			formatDate(dateString) {
				if (!dateString) return '-'
				const date = new Date(dateString)
				return date.toLocaleDateString('en-US', { 
					year: 'numeric', 
					month: 'short', 
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			},
			async exportReport(format) {
				if (!this.reportData || !this.reportData.filters) {
					this.$message.warning('Please generate a report first')
					return
				}
				
				this.exporting = true
				try {
					const params = {
						format: format,
						type: this.reportData.filters.report_type || 'combined',
						date_from: this.reportData.filters.date_from,
						date_to: this.reportData.filters.date_to,
					}
					
					// Handle executive_ids - can be array or comma-separated string
					if (this.reportData.filters.executive_ids && this.reportData.filters.executive_ids.length > 0) {
						if (Array.isArray(this.reportData.filters.executive_ids)) {
							// For multiple values, axios will handle array params
							params.executive_ids = this.reportData.filters.executive_ids
						} else {
							params.executive_ids = [this.reportData.filters.executive_ids]
						}
					}
					
					// Handle customer_ids - can be array or comma-separated string
					if (this.reportData.filters.customer_ids && this.reportData.filters.customer_ids.length > 0) {
						if (Array.isArray(this.reportData.filters.customer_ids)) {
							params.customer_ids = this.reportData.filters.customer_ids
						} else {
							params.customer_ids = [this.reportData.filters.customer_ids]
						}
					}
					
					const response = await dashboardAPI.exportReport(params)
					
					// Handle blob response
					let blob
					if (response.data instanceof Blob) {
						blob = response.data
					} else if (typeof response.data === 'string') {
						// If it's a string, convert to blob
						blob = new Blob([response.data], { 
							type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' 
						})
					} else {
						// Try to create blob from response
						blob = new Blob([response.data], { 
							type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' 
						})
					}
					
					// Create download link
					const url = window.URL.createObjectURL(blob)
					const link = document.createElement('a')
					link.href = url
					link.download = `report_${this.reportData.filters.report_type || 'combined'}_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'csv'}`
					link.style.display = 'none'
					document.body.appendChild(link)
					link.click()
					
					// Clean up
					setTimeout(() => {
						document.body.removeChild(link)
						window.URL.revokeObjectURL(url)
					}, 100)
					
					this.$message.success(`Report exported as ${format.toUpperCase()} successfully!`)
				} catch (error) {
					console.error('Error exporting report:', error)
					const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to export report'
					this.$message.error(`Failed to export report: ${errorMessage}`)
				} finally {
					this.exporting = false
				}
			},
		},
	}
</script>

<style lang="scss">
</style>
