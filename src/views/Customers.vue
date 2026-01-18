<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Customers</h6>
				<p>Manage all customers</p>
			</template>
			<template #extra>
				<a-input-search
					placeholder="Search customers..."
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
				:data-source="customers"
				:loading="loading"
				:pagination="pagination"
				:row-key="record => record.id"
				@change="handleTableChange"
			>
				<template slot="name" slot-scope="text, record">
					<div>
						<h6 class="mb-0">{{ text }}</h6>
						<p class="text-muted mb-0">{{ record.company }}</p>
					</div>
				</template>
				<template slot="created_by" slot-scope="text, record">
					{{ record.created_by_name || text || '-' }}
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

		<!-- Edit Customer Modal -->
		<a-modal
			title="Edit Customer"
			:visible="editModalVisible"
			@ok="handleUpdate"
			@cancel="handleCancelEdit"
			:confirmLoading="updating"
			width="700px"
		>
			<a-form :form="editForm" layout="vertical">
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="Name" required>
							<a-input
								v-decorator="['name', { rules: [{ required: true, message: 'Please enter customer name' }] }]"
								placeholder="Enter customer name"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Company">
							<a-input
								v-decorator="['company']"
								placeholder="Enter company name"
							/>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="Email">
							<a-input
								v-decorator="['email', { rules: [{ type: 'email', message: 'Please enter a valid email' }] }]"
								placeholder="Enter email"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Phone">
							<a-input
								v-decorator="['phone']"
								placeholder="Enter phone number"
							/>
						</a-form-item>
					</a-col>
				</a-row>
				<a-form-item label="Address">
					<a-textarea
						v-decorator="['address']"
						placeholder="Enter address"
						:rows="3"
					/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script>
	import { crmAPI } from '../services/api'

	export default {
		data() {
			return {
				customers: [],
				loading: false,
				searchText: '',
				editModalVisible: false,
				updating: false,
				editingCustomer: null,
				editForm: this.$form.createForm(this),
				pagination: {
					current: 1,
					pageSize: 10,
					total: 0,
				},
				columns: [
					{
						title: 'Name',
						dataIndex: 'name',
						scopedSlots: { customRender: 'name' },
						sorter: (a, b) => {
							const nameA = (a.name || '').toLowerCase()
							const nameB = (b.name || '').toLowerCase()
							return nameA.localeCompare(nameB)
						},
					},
					{
						title: 'Email',
						dataIndex: 'email',
						sorter: (a, b) => {
							const emailA = (a.email || '').toLowerCase()
							const emailB = (b.email || '').toLowerCase()
							return emailA.localeCompare(emailB)
						},
					},
					{
						title: 'Phone',
						dataIndex: 'phone',
						sorter: (a, b) => {
							const phoneA = (a.phone || '').toLowerCase()
							const phoneB = (b.phone || '').toLowerCase()
							return phoneA.localeCompare(phoneB)
						},
					},
					{
						title: 'Address',
						dataIndex: 'address',
						ellipsis: true,
						sorter: (a, b) => {
							const addrA = (a.address || '').toLowerCase()
							const addrB = (b.address || '').toLowerCase()
							return addrA.localeCompare(addrB)
						},
					},
					{
						title: 'Created By',
						dataIndex: 'created_by',
						scopedSlots: { customRender: 'created_by' },
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
						title: 'Actions',
						key: 'actions',
						scopedSlots: { customRender: 'actions' },
						width: 100,
					},
				],
			}
		},
		mounted() {
			this.loadCustomers()
		},
		methods: {
			async loadCustomers() {
				this.loading = true
				try {
					const params = {
						page: this.pagination.current,
						page_size: this.pagination.pageSize,
					}
					if (this.searchText) {
						params.search = this.searchText
					}
					const response = await crmAPI.getCustomers(params)
					if (response.data) {
						this.customers = response.data.results || response.data || []
						if (response.data.count !== undefined) {
							this.pagination.total = response.data.count
						} else if (Array.isArray(response.data)) {
							this.pagination.total = response.data.length
						}
					}
				} catch (error) {
					console.error('Error loading customers:', error)
					this.$message.error('Failed to load customers')
				} finally {
					this.loading = false
				}
			},
			handleTableChange(pagination, filters, sorter) {
				this.pagination.current = pagination.current
				this.pagination.pageSize = pagination.pageSize
				// Note: Sorting is handled client-side by Ant Design Vue
				this.loadCustomers()
			},
			handleSearch(value) {
				// Handle both direct value and event
				if (value !== undefined && value !== null) {
					this.searchText = value
				}
				this.pagination.current = 1
				this.loadCustomers()
			},
			showEditModal(record) {
				this.editingCustomer = record
				this.editModalVisible = true
				this.$nextTick(() => {
					this.editForm.setFieldsValue({
						name: record.name,
						company: record.company,
						email: record.email,
						phone: record.phone,
						address: record.address,
					})
				})
			},
			handleCancelEdit() {
				this.editModalVisible = false
				this.editingCustomer = null
				this.editForm.resetFields()
			},
			handleUpdate() {
				this.editForm.validateFields(async (err, values) => {
					if (!err) {
						this.updating = true
						try {
							await crmAPI.updateCustomer(this.editingCustomer.id, values)
							this.$message.success('Customer updated successfully!')
							this.editModalVisible = false
							this.editingCustomer = null
							this.editForm.resetFields()
							this.loadCustomers()
						} catch (error) {
							console.error('Error updating customer:', error)
							const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to update customer'
							this.$message.error(errorMessage)
						} finally {
							this.updating = false
						}
					}
				})
			},
			formatDate(dateString) {
				if (!dateString) return '-'
				const date = new Date(dateString)
				return date.toLocaleDateString()
			},
		},
	}
</script>

<style lang="scss">
</style>
