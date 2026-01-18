<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Leads</h6>
				<p>Manage and track all leads</p>
			</template>
			<template #extra>
				<a-radio-group v-model="viewType" @change="loadLeads" style="margin-right: 16px">
					<a-radio-button value="table">Table</a-radio-button>
					<a-radio-button value="kanban">Kanban</a-radio-button>
				</a-radio-group>
			<a-input-search
				placeholder="Search leads..."
				style="width: 200px; margin-right: 10px"
				@search="handleSearch"
				@pressEnter="handleSearch"
				v-model="searchText"
			/>
			</template>
		</a-card>

		<!-- Filters Card -->
		<a-card :bordered="false" class="mb-24" v-if="viewType === 'kanban'">
			<a-row :gutter="16">
				<a-col :span="8">
					<a-select
						v-model="filters.includeStatus"
						mode="multiple"
						placeholder="Include Status"
						allowClear
						style="width: 100%"
						@change="loadLeads"
					>
						<a-select-option v-for="status in statusOptions" :key="status.value" :value="status.value">
							{{ status.label }}
						</a-select-option>
					</a-select>
				</a-col>
				<a-col :span="8">
					<a-select
						v-model="filters.excludeStatus"
						mode="multiple"
						placeholder="Exclude Status"
						allowClear
						style="width: 100%"
						@change="loadLeads"
					>
						<a-select-option v-for="status in statusOptions" :key="status.value" :value="status.value">
							{{ status.label }}
						</a-select-option>
					</a-select>
				</a-col>
				<a-col :span="8">
					<a-button type="primary" @click="loadLeads" style="width: 100%">Apply Filters</a-button>
				</a-col>
			</a-row>
		</a-card>

		<!-- Kanban Board View -->
		<div v-if="viewType === 'kanban'" class="kanban-board">
			<div
				v-for="status in statusOptions"
				:key="status.value"
				class="kanban-column"
				:data-status="status.value"
				@drop="onDrop($event, status.value)"
				@dragover.prevent
				@dragenter.prevent
			>
				<div class="kanban-header">
					<h6>{{ status.label }}</h6>
					<a-badge :count="getLeadsCount(status.value)" />
				</div>
				<div class="kanban-list">
					<div
						v-for="lead in getLeadsForStatus(status.value)"
						:key="lead.id"
						class="kanban-card"
						:draggable="true"
						@dragstart="onDragStart($event, lead)"
						@dragend="onDragEnd"
					>
						<h6 class="mb-1">{{ lead.customer_name }}</h6>
						<p class="text-muted mb-1" v-if="lead.customer_company">{{ lead.customer_company }}</p>
						<a-tag size="small" v-if="lead.sales_executive_name">{{ lead.sales_executive_name }}</a-tag>
						<div class="kanban-card-actions">
							<a-button type="link" size="small" @click="showEditModal(lead)">Edit</a-button>
						</div>
					</div>
					<div v-if="getLeadsForStatus(status.value).length === 0" class="kanban-empty">
						<p class="text-muted">No leads</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Table View -->
		<a-card :bordered="false" v-if="viewType === 'table'">
			<a-select
				v-model="statusFilter"
				style="width: 180px; margin-bottom: 16px"
				placeholder="Filter by status"
				allowClear
				@change="loadLeads"
			>
				<a-select-option value="interested">Interested</a-select-option>
				<a-select-option value="quotation_requested">Quotation Requested</a-select-option>
				<a-select-option value="follow_up_required">Follow-up Required</a-select-option>
				<a-select-option value="negotiation_ongoing">Negotiation Ongoing</a-select-option>
				<a-select-option value="not_interested">Not Interested</a-select-option>
				<a-select-option value="deal_closed">Deal Closed</a-select-option>
			</a-select>
			<a-table
				:columns="columns"
				:data-source="leads"
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
				<template slot="status" slot-scope="status">
					<a-tag :color="getStatusColor(status)">{{ formatStatus(status) }}</a-tag>
				</template>
				<template slot="created_at" slot-scope="date">
					{{ formatDate(date) }}
				</template>
				<template slot="actions" slot-scope="text, record">
					<a-button type="link" size="small" @click="showEditModal(record)">
						<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M14.8461 1.90323C15.2663 1.48016 15.2663 0.806452 14.8461 0.383387C14.426 -0.0396774 13.754 -0.0396774 13.3339 0.383387L12.6667 1.05323L14.1795 2.57323L14.8461 1.90323ZM11.3333 2.66667L2 12H2.66667V13.3333H4V14.6667H5.33333V16H6.66667V17.3333H8V18.6667H9.33333V20H18L8.66667 10.6667L11.3333 2.66667Z" fill="currentColor"/>
						</svg>
						Edit
					</a-button>
				</template>
			</a-table>
		</a-card>

		<!-- Edit Lead Modal -->
		<a-modal
			title="Edit Lead"
			:visible="editModalVisible"
			@ok="handleUpdate"
			@cancel="handleCancelEdit"
			:confirmLoading="updating"
			width="700px"
		>
			<a-form :form="editForm" layout="vertical">
				<a-form-item label="Customer" required>
					<a-select
						v-decorator="['customer', { rules: [{ required: true, message: 'Please select a customer' }] }]"
						placeholder="Select customer"
						:loading="loadingCustomers"
						show-search
						:filter-option="filterCustomerOption"
					>
						<a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
							{{ customer.name }} - {{ customer.company || 'N/A' }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Status" required>
					<a-select
						v-decorator="['status', { rules: [{ required: true, message: 'Please select a status' }] }]"
						placeholder="Select status"
					>
						<a-select-option value="interested">Interested</a-select-option>
						<a-select-option value="quotation_requested">Quotation Requested</a-select-option>
						<a-select-option value="follow_up_required">Follow-up Required</a-select-option>
						<a-select-option value="negotiation_ongoing">Negotiation Ongoing</a-select-option>
						<a-select-option value="not_interested">Not Interested</a-select-option>
						<a-select-option value="deal_closed">Deal Closed</a-select-option>
						<a-select-option value="deal_lost">Deal Lost</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Sales Executive">
					<a-select
						v-decorator="['sales_executive']"
						placeholder="Select sales executive"
						:loading="loadingExecutives"
					>
						<a-select-option v-for="exec in executives" :key="exec.id" :value="exec.id">
							{{ exec.first_name }} {{ exec.last_name }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Notes">
					<a-textarea
						v-decorator="['notes']"
						placeholder="Enter notes"
						:rows="4"
					/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script>
	import { dashboardAPI, crmAPI } from '../services/api'

	export default {
		data() {
			return {
				leads: [],
				leadsByStatus: {},
				customers: [],
				executives: [],
				loading: false,
				loadingCustomers: false,
				loadingExecutives: false,
				searchText: '',
				statusFilter: null,
				viewType: 'table',
				draggedLead: null,
				filters: {
					includeStatus: null,
					excludeStatus: null,
				},
				statusOptions: [
					{ value: 'interested', label: 'Interested' },
					{ value: 'quotation_requested', label: 'Quotation Requested' },
					{ value: 'follow_up_required', label: 'Follow-up Required' },
					{ value: 'negotiation_ongoing', label: 'Negotiation Ongoing' },
					{ value: 'not_interested', label: 'Not Interested' },
					{ value: 'deal_closed', label: 'Deal Closed' },
				],
				editModalVisible: false,
				updating: false,
				editingLead: null,
				editForm: this.$form.createForm(this),
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
						title: 'Status',
						dataIndex: 'status',
						scopedSlots: { customRender: 'status' },
						sorter: (a, b) => {
							const statusA = (a.status || '').toLowerCase()
							const statusB = (b.status || '').toLowerCase()
							return statusA.localeCompare(statusB)
						},
					},
					{
						title: 'Created At',
						dataIndex: 'created_at',
						scopedSlots: { customRender: 'created_at' },
						sorter: (a, b) => {
							const dateA = new Date(a.created_at || 0)
							const dateB = new Date(b.created_at || 0)
							return dateA - dateB
						},
					},
					{
						title: 'Notes',
						dataIndex: 'notes',
						ellipsis: true,
						sorter: (a, b) => {
							const notesA = (a.notes || '').toLowerCase()
							const notesB = (b.notes || '').toLowerCase()
							return notesA.localeCompare(notesB)
						},
					},
					{
						title: 'Actions',
						key: 'actions',
						scopedSlots: { customRender: 'actions' },
						width: 100,
					},
				],
			}
		},
		mounted() {
			this.loadLeads()
			this.loadCustomers()
			this.loadExecutives()
		},
		methods: {
			async loadLeads() {
				this.loading = true
				try {
					const params = {
						view_type: this.viewType,
					}
					
					if (this.viewType === 'kanban') {
						// Kanban view
						if (this.filters.includeStatus && this.filters.includeStatus.length) {
							params.status = this.filters.includeStatus.join(',')
						}
						if (this.filters.excludeStatus && this.filters.excludeStatus.length) {
							params.exclude_status = this.filters.excludeStatus.join(',')
						}
					} else {
						// Table view
						params.page = this.pagination.current
						params.page_size = this.pagination.pageSize
						if (this.statusFilter) {
							params.status = this.statusFilter
						}
					}
					
					if (this.searchText) {
						params.search = this.searchText
					}
					
					const response = await dashboardAPI.getLeads(params)
					if (response.data) {
						if (this.viewType === 'kanban') {
							this.leadsByStatus = response.data.leads_by_status || {}
						} else {
							this.leads = response.data.data || response.data.results || []
							this.pagination.total = response.data.total || response.data.count || 0
						}
					}
				} catch (error) {
					console.error('Error loading leads:', error)
					this.$message.error('Failed to load leads')
				} finally {
					this.loading = false
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
				} finally {
					this.loadingCustomers = false
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
			handleTableChange(pagination) {
				this.pagination.current = pagination.current
				this.pagination.pageSize = pagination.pageSize
				this.loadLeads()
			},
			handleSearch(value) {
				// Handle both direct value and event
				if (value !== undefined && value !== null) {
					this.searchText = value
				}
				this.pagination.current = 1
				this.loadLeads()
			},
			showEditModal(record) {
				this.editingLead = record
				this.editModalVisible = true
				this.$nextTick(() => {
					this.editForm.setFieldsValue({
						customer: record.customer,
						sales_executive: record.sales_executive,
						status: record.status,
						notes: record.notes,
					})
				})
			},
			handleCancelEdit() {
				this.editModalVisible = false
				this.editingLead = null
				this.editForm.resetFields()
			},
			handleUpdate() {
				this.editForm.validateFields(async (err, values) => {
					if (!err) {
						this.updating = true
						try {
							await crmAPI.updateLead(this.editingLead.id, values)
							this.$message.success('Lead updated successfully!')
							this.editModalVisible = false
							this.editingLead = null
							this.editForm.resetFields()
							this.loadLeads()
						} catch (error) {
							console.error('Error updating lead:', error)
							const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to update lead'
							this.$message.error(errorMessage)
						} finally {
							this.updating = false
						}
					}
				})
			},
			filterCustomerOption(input, option) {
				return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
			},
			formatDate(dateString) {
				if (!dateString) return '-'
				const date = new Date(dateString)
				return date.toLocaleDateString()
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
			getLeadsCount(statusValue) {
				return (this.leadsByStatus[statusValue] && this.leadsByStatus[statusValue].count) || 0
			},
			getLeadsForStatus(statusValue) {
				return (this.leadsByStatus[statusValue] && this.leadsByStatus[statusValue].leads) || []
			},
			onDragStart(event, lead) {
				this.draggedLead = lead
				event.dataTransfer.effectAllowed = 'move'
				event.dataTransfer.setData('text/html', lead.id)
				event.currentTarget.style.opacity = '0.5'
			},
			onDragEnd(event) {
				event.currentTarget.style.opacity = '1'
			},
			async onDrop(event, newStatus) {
				event.preventDefault()
				if (!this.draggedLead) return
				
				// Don't update if dropped in same column
				if (this.draggedLead.status === newStatus) {
					this.draggedLead = null
					return
				}
				
				try {
					await crmAPI.updateLeadStatus(this.draggedLead.id, { status: newStatus })
					this.$message.success('Lead status updated successfully!')
					this.loadLeads()
				} catch (error) {
					console.error('Error updating lead status:', error)
					this.$message.error('Failed to update lead status')
					this.loadLeads() // Reload to revert
				} finally {
					this.draggedLead = null
				}
			},
		},
	}
</script>

<style lang="scss">
.kanban-board {
	display: flex;
	gap: 16px;
	overflow-x: auto;
	padding-bottom: 16px;
	
	// Hide scrollbar but keep scroll functionality
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
	
	&::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}
	
	.kanban-column {
		min-width: 300px;
		background: #f5f5f5;
		border-radius: 8px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		
		.kanban-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16px;
			padding-bottom: 12px;
			border-bottom: 2px solid #e0e0e0;
			
			h6 {
				margin: 0;
				font-weight: 600;
			}
		}
		
		.kanban-list {
			flex: 1;
			min-height: 400px;
			max-height: calc(100vh - 300px);
			overflow-y: auto;
			
			// Hide scrollbar but keep scroll functionality
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE and Edge */
			
			&::-webkit-scrollbar {
				display: none; /* Chrome, Safari, Opera */
			}
		}
		
		.kanban-card {
			background: white;
			padding: 12px;
			margin-bottom: 12px;
			border-radius: 6px;
			cursor: move;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			transition: all 0.2s;
			
			&:hover {
				box-shadow: 0 4px 8px rgba(0,0,0,0.15);
				transform: translateY(-2px);
			}
			
			&:active {
				cursor: grabbing;
			}
			
			h6 {
				margin: 0 0 4px 0;
				font-size: 14px;
				font-weight: 600;
			}
			
			.text-muted {
				font-size: 12px;
				color: #8c8c8c;
			}
			
			.kanban-card-actions {
				margin-top: 8px;
				padding-top: 8px;
				border-top: 1px solid #f0f0f0;
			}
		}
		
		.kanban-empty {
			text-align: center;
			padding: 40px 20px;
			color: #8c8c8c;
		}
	}
}
</style>
