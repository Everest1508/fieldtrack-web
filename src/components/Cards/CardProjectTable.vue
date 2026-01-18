<template>
				
	<!-- Recent Visits Table Card -->
	<a-card :bordered="false" class="header-solid h-full" :bodyStyle="{padding: 0,}">
		<template #title>
			<a-row type="flex" align="middle">
				<a-col :span="24">
					<h6>Recent Field Visits</h6>			
					<p>Latest customer visits</p>	
				</a-col>
			</a-row>
		</template>
		<a-table :columns="columns" :data-source="data" :pagination="false">

			<template slot="customer" slot-scope="text, record">
				<div>
					<h6 class="m-0">{{ record.customer_name || '-' }}</h6>
					<p class="text-muted mb-0" style="font-size: 12px;">{{ record.customer_company || '' }}</p>
				</div>
			</template>

			<template slot="sales_executive" slot-scope="text, record">
				{{ record.sales_executive_name || '-' }}
			</template>

			<template slot="visit_date" slot-scope="date">
				{{ formatDate(date) }}
			</template>

			<template slot="status" slot-scope="status">
				<a-tag :color="getStatusColor(status)">{{ formatStatus(status) }}</a-tag>
			</template>

		</a-table>
	</a-card>
	<!-- / Recent Visits Table Card -->

</template>

<script>

	export default ({
		props: {
			data: {
				type: Array,
				default: () => [],
			},
			columns: {
				type: Array,
				default: () => [],
			},
		},
		data() {
			return {
			}
		},
		methods: {
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
				return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
			},
		},
	})

</script>