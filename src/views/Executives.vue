<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Sales Executives</h6>
				<p>Manage sales executives and their performance</p>
			</template>
			<template #extra>
				<a-button type="primary" @click="showCreateModal">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M10 3C10.5523 3 11 3.44772 11 4V9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 3.44772 9 4 9H9V4C9 3.44772 9.44772 3 10 3Z" fill="white"/>
					</svg>
					Add Executive
				</a-button>
			</template>
		</a-card>

		<a-card :bordered="false">
			<a-table
				:columns="columns"
				:data-source="executives"
				:loading="loading"
				:pagination="false"
			>
				<template slot="name" slot-scope="text, record">
					<div style="display: flex; align-items: center;">
						<a-avatar :size="40" style="background-color: #1890ff; margin-right: 12px;">
							{{ record.first_name.charAt(0) }}{{ record.last_name.charAt(0) }}
						</a-avatar>
						<div>
							<h6 class="mb-0">{{ record.first_name }} {{ record.last_name }}</h6>
							<p class="text-muted mb-0" style="font-size: 12px;">{{ record.email }}</p>
						</div>
					</div>
				</template>
				<template slot="phone" slot-scope="phone">
					{{ phone || '-' }}
				</template>
				<template slot="visits" slot-scope="text, record">
					<span style="font-weight: 600;">{{ record.stats.total_visits }}</span>
				</template>
				<template slot="leads" slot-scope="text, record">
					<span style="font-weight: 600;">{{ record.stats.total_leads }}</span>
				</template>
				<template slot="closed" slot-scope="text, record">
					<span style="font-weight: 600;">{{ record.stats.closed_deals }}</span>
				</template>
				<template slot="conversion" slot-scope="text, record">
					<a-progress 
						:percent="record.stats.conversion_rate" 
						:status="record.stats.conversion_rate >= 50 ? 'success' : record.stats.conversion_rate >= 30 ? 'active' : 'exception'"
						:stroke-width="8"
						:show-info="true"
					/>
				</template>
				<template slot="status" slot-scope="text, record">
					<a-tag :color="record.is_active ? 'green' : 'red'">
						{{ record.is_active ? 'Active' : 'Inactive' }}
					</a-tag>
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

		<!-- Create Executive Modal -->
		<a-modal
			title="Add Sales Executive"
			:visible="createModalVisible"
			@ok="handleCreate"
			@cancel="handleCancel"
			:confirmLoading="creating"
			width="600px"
		>
			<a-form :form="form" layout="vertical">
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="Username" required>
							<a-input
								v-decorator="['username', { rules: [{ required: true, message: 'Please enter username' }] }]"
								placeholder="Enter username"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Password" required>
							<a-input-password
								v-decorator="['password', { rules: [{ required: true, message: 'Please enter password' }, { min: 6, message: 'Password must be at least 6 characters' }] }]"
								placeholder="Enter password"
							/>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="First Name">
							<a-input
								v-decorator="['first_name']"
								placeholder="Enter first name"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Last Name">
							<a-input
								v-decorator="['last_name']"
								placeholder="Enter last name"
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
			</a-form>
		</a-modal>

		<!-- Edit Executive Modal -->
		<a-modal
			title="Edit Sales Executive"
			:visible="editModalVisible"
			@ok="handleUpdate"
			@cancel="handleCancelEdit"
			:confirmLoading="updating"
			width="600px"
		>
			<a-form :form="editForm" layout="vertical">
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="Username">
							<a-input
								v-decorator="['username']"
								placeholder="Username"
								disabled
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Password (leave blank to keep current)">
							<a-input-password
								v-decorator="['password']"
								placeholder="Enter new password"
							/>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="First Name">
							<a-input
								v-decorator="['first_name']"
								placeholder="Enter first name"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="Last Name">
							<a-input
								v-decorator="['last_name']"
								placeholder="Enter last name"
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
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="Status">
							<a-switch
								v-decorator="['is_active', { valuePropName: 'checked' }]"
							/>
							<span style="margin-left: 8px;">Active</span>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>

<script>
	import { dashboardAPI } from '../services/api'

	export default {
		data() {
			return {
				executives: [],
				loading: false,
				createModalVisible: false,
				editModalVisible: false,
				creating: false,
				updating: false,
				editingExecutive: null,
				form: this.$form.createForm(this),
				editForm: this.$form.createForm(this),
				columns: [
					{
						title: 'Name',
						dataIndex: 'name',
						scopedSlots: { customRender: 'name' },
						width: 250,
					},
					{
						title: 'Username',
						dataIndex: 'username',
					},
					{
						title: 'Phone',
						dataIndex: 'phone',
						scopedSlots: { customRender: 'phone' },
					},
					{
						title: 'Visits',
						dataIndex: 'visits',
						scopedSlots: { customRender: 'visits' },
						align: 'center',
					},
					{
						title: 'Leads',
						dataIndex: 'leads',
						scopedSlots: { customRender: 'leads' },
						align: 'center',
					},
					{
						title: 'Closed Deals',
						dataIndex: 'closed',
						scopedSlots: { customRender: 'closed' },
						align: 'center',
					},
					{
						title: 'Conversion Rate',
						dataIndex: 'conversion',
						scopedSlots: { customRender: 'conversion' },
						width: 200,
					},
					{
						title: 'Status',
						dataIndex: 'status',
						scopedSlots: { customRender: 'status' },
						align: 'center',
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
			this.loadExecutives()
		},
		methods: {
			async loadExecutives() {
				this.loading = true
				try {
					const response = await dashboardAPI.getExecutives()
					if (response.data && response.data.data) {
						this.executives = response.data.data
					}
				} catch (error) {
					console.error('Error loading executives:', error)
					this.$message.error('Failed to load executives')
				} finally {
					this.loading = false
				}
			},
			showCreateModal() {
				this.createModalVisible = true
				this.form.resetFields()
			},
			showEditModal(record) {
				this.editingExecutive = record
				this.editModalVisible = true
				this.$nextTick(() => {
					this.editForm.setFieldsValue({
						username: record.username,
						first_name: record.first_name,
						last_name: record.last_name,
						email: record.email,
						phone: record.phone,
						is_active: record.is_active,
					})
				})
			},
			handleCancel() {
				this.createModalVisible = false
				this.form.resetFields()
			},
			handleCancelEdit() {
				this.editModalVisible = false
				this.editingExecutive = null
				this.editForm.resetFields()
			},
			handleCreate() {
				this.form.validateFields(async (err, values) => {
					if (!err) {
						this.creating = true
						try {
							await dashboardAPI.createExecutive(values)
							this.$message.success('Sales executive created successfully!')
							this.createModalVisible = false
							this.form.resetFields()
							this.loadExecutives()
						} catch (error) {
							console.error('Error creating executive:', error)
							const errorMessage = error.response?.data?.error || 'Failed to create sales executive'
							this.$message.error(errorMessage)
						} finally {
							this.creating = false
						}
					}
				})
			},
			handleUpdate() {
				this.editForm.validateFields(async (err, values) => {
					if (!err) {
						this.updating = true
						try {
							// Remove password if empty
							if (!values.password) {
								delete values.password
							}
							await dashboardAPI.updateExecutive(this.editingExecutive.id, values)
							this.$message.success('Sales executive updated successfully!')
							this.editModalVisible = false
							this.editingExecutive = null
							this.editForm.resetFields()
							this.loadExecutives()
						} catch (error) {
							console.error('Error updating executive:', error)
							const errorMessage = error.response?.data?.error || 'Failed to update sales executive'
							this.$message.error(errorMessage)
						} finally {
							this.updating = false
						}
					}
				})
			},
		},
	}
</script>

<style lang="scss">
</style>
