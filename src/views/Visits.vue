<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Field Visits</h6>
				<p>Manage and track all field visits</p>
			</template>
			<template #extra>
				<a-input-search
					placeholder="Search visits..."
					style="width: 200px"
					@search="handleSearch"
					@pressEnter="handleSearch"
					v-model="searchText"
				/>
			</template>
		</a-card>

		<a-card :bordered="false">
			<a-table
				:columns="columns"
				:data-source="visits"
				:loading="loading"
				:pagination="pagination"
				:row-key="record => record.id"
				@change="handleTableChange"
			>
				<template slot="customer" slot-scope="text, record">
					<div>
						<h6 class="mb-0">{{ record.customer_name || '-' }}</h6>
						<p class="text-muted mb-0">{{ record.customer_company || '-' }}</p>
					</div>
				</template>
				<template slot="sales_executive" slot-scope="text, record">
					{{ record.sales_executive_name || '-' }}
				</template>
				<template slot="visit_date" slot-scope="date">
					{{ formatDate(date) }}
				</template>
				<template slot="discussion_status" slot-scope="status">
					<a-tag :color="getStatusColor(status)">{{ formatStatus(status) }}</a-tag>
				</template>
			</a-table>
		</a-card>
	</div>
</template>

<script>
	import { dashboardAPI } from '../services/api'

	export default {
		data() {
			return {
				visits: [],
				loading: false,
				searchText: '',
				pagination: {
					current: 1,
					pageSize: 10,
					total: 0,
				},
				columns: [
					{
						title: 'Customer',
						dataIndex: 'customer',
						scopedSlots: { customRender: 'customer' },
						sorter: (a, b) => {
							const nameA = (a.customer_name || '').toLowerCase()
							const nameB = (b.customer_name || '').toLowerCase()
							return nameA.localeCompare(nameB)
						},
					},
					{
						title: 'Sales Executive',
						dataIndex: 'sales_executive',
						scopedSlots: { customRender: 'sales_executive' },
						sorter: (a, b) => {
							const nameA = (a.sales_executive_name || '').toLowerCase()
							const nameB = (b.sales_executive_name || '').toLowerCase()
							return nameA.localeCompare(nameB)
						},
					},
					{
						title: 'Visit Date',
						dataIndex: 'visit_date',
						scopedSlots: { customRender: 'visit_date' },
						sorter: (a, b) => {
							const dateA = new Date(a.visit_date || 0)
							const dateB = new Date(b.visit_date || 0)
							return dateA - dateB
						},
					},
					{
						title: 'Purpose',
						dataIndex: 'purpose',
						sorter: (a, b) => {
							const purposeA = (a.purpose || '').toLowerCase()
							const purposeB = (b.purpose || '').toLowerCase()
							return purposeA.localeCompare(purposeB)
						},
					},
					{
						title: 'Status',
						dataIndex: 'discussion_status',
						scopedSlots: { customRender: 'discussion_status' },
						sorter: (a, b) => {
							const statusA = (a.discussion_status || '').toLowerCase()
							const statusB = (b.discussion_status || '').toLowerCase()
							return statusA.localeCompare(statusB)
						},
					},
				],
			}
		},
		mounted() {
			this.loadVisits()
		},
		methods: {
			async loadVisits() {
				this.loading = true
				try {
					const params = {
						page: this.pagination.current,
						page_size: this.pagination.pageSize,
					}
					if (this.searchText) {
						params.search = this.searchText
					}
					const response = await dashboardAPI.getVisits(params)
					if (response.data) {
						this.visits = response.data.data || []
						this.pagination.total = response.data.total || 0
					}
				} catch (error) {
					console.error('Error loading visits:', error)
					this.$message.error('Failed to load visits')
				} finally {
					this.loading = false
				}
			},
			handleTableChange(pagination, filters, sorter) {
				this.pagination.current = pagination.current
				this.pagination.pageSize = pagination.pageSize
				// Note: Sorting is handled client-side by Ant Design Vue
				this.loadVisits()
			},
			handleSearch(value) {
				// Handle both direct value and event
				if (value !== undefined && value !== null) {
					this.searchText = value
				}
				this.pagination.current = 1
				this.loadVisits()
			},
			formatDate(dateString) {
				if (!dateString) return '-'
				const date = new Date(dateString)
				return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			},
			getStatusColor(status) {
				const colors = {
					interested: 'green',
					quotation_requested: 'blue',
					follow_up_required: 'orange',
					negotiation_ongoing: 'purple',
					not_interested: 'red',
					deal_closed: 'green',
				}
				return colors[status] || 'geekblue'
			},
			formatStatus(status) {
				if (!status) return '-'
				return status.charAt(0).toUpperCase() + status.slice(1)
			},
		},
	}
</script>

<style lang="scss">
</style>

