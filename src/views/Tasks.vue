<template>
	<div>
		<a-card :bordered="false" class="header-solid mb-24">
			<template #title>
				<h6>Task Management</h6>
				<p>Assign and manage tasks for sales executives</p>
			</template>
			<template #extra>
				<a-radio-group v-model="viewType" @change="loadTasks" style="margin-right: 16px">
					<a-radio-button value="table">Table</a-radio-button>
					<a-radio-button value="kanban">Kanban</a-radio-button>
				</a-radio-group>
				<a-button type="primary" @click="showCreateModal" icon="plus">
					Create Task
				</a-button>
			</template>
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
					<a-badge :count="getTasksCount(status.value)" />
				</div>
				<div class="kanban-list">
					<div
						v-for="task in getTasksForStatus(status.value)"
						:key="task.id"
						class="kanban-card"
						:draggable="true"
						@dragstart="onDragStart($event, task)"
						@dragend="onDragEnd"
					>
						<h6 class="mb-1">{{ task.title }}</h6>
						<p class="text-muted mb-1" v-if="task.description">{{ task.description.substring(0, 50) }}...</p>
						<div class="mb-1">
							<a-tag size="small" :color="getPriorityColor(task.priority)">{{ formatPriority(task.priority) }}</a-tag>
							<a-tag size="small" v-if="task.assigned_to_name">{{ task.assigned_to_name }}</a-tag>
						</div>
						<p class="text-muted mb-1" v-if="task.company_display || task.company">
							<small>{{ task.company_display || task.company }}</small>
						</p>
						<p class="text-muted mb-1" v-if="task.due_date">
							<small>Due: {{ formatDate(task.due_date) }}</small>
						</p>
						<div class="kanban-card-actions">
							<a-button type="link" size="small" @click="showEditModal(task)">Edit</a-button>
						</div>
					</div>
					<div v-if="getTasksForStatus(status.value).length === 0" class="kanban-empty">
						<p class="text-muted">No tasks</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Table View -->
		<a-card :bordered="false" v-if="viewType === 'table'">
			<!-- Filters -->
			<a-row :gutter="16" style="margin-bottom: 16px">
				<a-col :span="6">
					<a-select
						v-model="filters.status"
						placeholder="Filter by Status"
						allowClear
						style="width: 100%"
						@change="loadTasks"
					>
						<a-select-option value="pending">Pending</a-select-option>
						<a-select-option value="in_progress">In Progress</a-select-option>
						<a-select-option value="completed">Completed</a-select-option>
						<a-select-option value="cancelled">Cancelled</a-select-option>
					</a-select>
				</a-col>
				<a-col :span="6">
					<a-select
						v-model="filters.assigned_to"
						placeholder="Filter by Assigned To"
						allowClear
						style="width: 100%"
						:loading="loadingExecutives"
						@change="loadTasks"
					>
						<a-select-option v-for="exec in executives" :key="exec.id" :value="exec.id">
							{{ exec.username || `${exec.first_name} ${exec.last_name}` }}
						</a-select-option>
					</a-select>
				</a-col>
				<a-col :span="6">
					<a-select
						v-model="filters.priority"
						placeholder="Filter by Priority"
						allowClear
						style="width: 100%"
						@change="loadTasks"
					>
						<a-select-option value="low">Low</a-select-option>
						<a-select-option value="medium">Medium</a-select-option>
						<a-select-option value="high">High</a-select-option>
						<a-select-option value="urgent">Urgent</a-select-option>
					</a-select>
				</a-col>
				<a-col :span="6">
				<a-input-search
					v-model="searchText"
					placeholder="Search tasks..."
					style="width: 100%"
					@search="handleSearch"
					@pressEnter="handleSearch"
				/>
				</a-col>
			</a-row>

			<!-- Tasks Table -->
			<a-table
				:columns="columns"
				:data-source="tasks"
				:loading="loading"
				:pagination="pagination"
				:row-key="record => record.id"
				@change="handleTableChange"
			>
				<template slot="title" slot-scope="text, record">
					<div v-if="record && record.title">
						<h6 class="mb-0">{{ record.title }}</h6>
						<p class="text-muted mb-0" v-if="record.description">{{ record.description.substring(0, 50) }}...</p>
					</div>
					<div v-else-if="text">
						<h6 class="mb-0">{{ text }}</h6>
					</div>
					<div v-else>
						<h6 class="mb-0">-</h6>
					</div>
				</template>
				<template slot="assigned_to" slot-scope="text, record">
					{{ (record && record.assigned_to_name) || text || '-' }}
				</template>
				<template slot="company" slot-scope="text, record">
					{{ (record && (record.company_display || record.company)) || text || '-' }}
				</template>
				<template slot="status" slot-scope="status">
					<a-tag :color="getStatusColor(status)">{{ formatStatus(status) }}</a-tag>
				</template>
				<template slot="priority" slot-scope="priority">
					<a-tag :color="getPriorityColor(priority)">{{ formatPriority(priority) }}</a-tag>
				</template>
				<template slot="due_date" slot-scope="date">
					{{ formatDate(date) }}
				</template>
				<template slot="actions" slot-scope="text, record">
					<a-space v-if="record">
						<a-button type="link" size="small" @click="showEditModal(record)">
							Edit
						</a-button>
						<a-button
							type="link"
							size="small"
							v-if="record.status !== 'completed'"
							@click="markCompleted(record.id)"
						>
							Complete
						</a-button>
					</a-space>
				</template>
			</a-table>
		</a-card>

		<!-- Create/Edit Task Modal -->
		<a-modal
			:title="modalTitle"
			:visible="modalVisible"
			@ok="handleSubmit"
			@cancel="handleCancel"
			:confirmLoading="saving"
			width="700px"
		>
			<a-form :form="taskForm" layout="vertical">
				<a-form-item label="Title" required>
					<a-input
						v-decorator="['title', { rules: [{ required: true, message: 'Please enter task title' }] }]"
						placeholder="Enter task title"
					/>
				</a-form-item>
				<a-form-item label="Task Type">
					<a-select
						v-decorator="['task_type', { initialValue: 'visit' }]"
						placeholder="Select task type"
					>
						<a-select-option value="visit">Field Visit</a-select-option>
						<a-select-option value="followup">Follow-up</a-select-option>
						<a-select-option value="lead_contact">Lead Contact</a-select-option>
						<a-select-option value="other">Other</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Assign To" required>
					<a-select
						v-decorator="['assigned_to', { rules: [{ required: true, message: 'Please select sales executive' }] }]"
						placeholder="Select sales executive"
						:loading="loadingExecutives"
					>
						<a-select-option v-for="exec in executives" :key="exec.id" :value="exec.id">
							{{ exec.username || `${exec.first_name} ${exec.last_name}` }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Customer">
					<a-select
						v-decorator="['customer']"
						placeholder="Select customer (optional)"
						:loading="loadingCustomers"
						show-search
						:filter-option="filterCustomerOption"
						allowClear
					>
						<a-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
							{{ customer.name }} - {{ customer.company || 'N/A' }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Company">
					<a-input
						v-decorator="['company']"
						placeholder="Or enter company name directly"
					/>
				</a-form-item>
				<a-form-item label="Due Date">
					<a-date-picker
						v-decorator="['due_date']"
						show-time
						format="YYYY-MM-DD HH:mm:ss"
						style="width: 100%"
					/>
				</a-form-item>
				<a-form-item label="Priority">
					<a-select
						v-decorator="['priority', { initialValue: 'medium' }]"
						placeholder="Select priority"
					>
						<a-select-option value="low">Low</a-select-option>
						<a-select-option value="medium">Medium</a-select-option>
						<a-select-option value="high">High</a-select-option>
						<a-select-option value="urgent">Urgent</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="Description">
					<a-textarea
						v-decorator="['description']"
						placeholder="Enter task description"
						:rows="4"
					/>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script>
import { taskAPI, dashboardAPI, crmAPI } from '../services/api'

export default {
	data() {
		return {
			tasks: [],
			executives: [],
			customers: [],
			loading: false,
			loadingExecutives: false,
			loadingCustomers: false,
			modalVisible: false,
			modalTitle: 'Create Task',
			saving: false,
			editingTask: null,
			taskForm: this.$form.createForm(this),
			searchText: '',
			viewType: 'kanban',
			tasksByStatus: {},
			draggedTask: null,
			statusOptions: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'in_progress', label: 'In Progress' },
				{ value: 'completed', label: 'Completed' },
				{ value: 'cancelled', label: 'Cancelled' },
			],
			filters: {
				status: null,
				assigned_to: null,
				priority: null,
			},
			pagination: {
				current: 1,
				pageSize: 10,
				total: 0,
			},
			columns: [
				{
					title: 'Title',
					dataIndex: 'title',
					scopedSlots: { customRender: 'title' },
					sorter: (a, b) => {
						const titleA = (a.title || '').toLowerCase()
						const titleB = (b.title || '').toLowerCase()
						return titleA.localeCompare(titleB)
					},
				},
				{
					title: 'Type',
					dataIndex: 'task_type',
					sorter: (a, b) => {
						const typeA = (a.task_type || '').toLowerCase()
						const typeB = (b.task_type || '').toLowerCase()
						return typeA.localeCompare(typeB)
					},
				},
				{
					title: 'Assigned To',
					dataIndex: 'assigned_to',
					scopedSlots: { customRender: 'assigned_to' },
					sorter: (a, b) => {
						const nameA = (a.assigned_to_name || '').toLowerCase()
						const nameB = (b.assigned_to_name || '').toLowerCase()
						return nameA.localeCompare(nameB)
					},
				},
				{
					title: 'Company',
					dataIndex: 'company',
					scopedSlots: { customRender: 'company' },
					sorter: (a, b) => {
						const companyA = ((a.company_display || a.company) || '').toLowerCase()
						const companyB = ((b.company_display || b.company) || '').toLowerCase()
						return companyA.localeCompare(companyB)
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
					title: 'Priority',
					dataIndex: 'priority',
					scopedSlots: { customRender: 'priority' },
					sorter: (a, b) => {
						const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
						return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
					},
				},
				{
					title: 'Due Date',
					dataIndex: 'due_date',
					scopedSlots: { customRender: 'due_date' },
					sorter: (a, b) => {
						const dateA = new Date(a.due_date || 0)
						const dateB = new Date(b.due_date || 0)
						return dateA - dateB
					},
				},
				{
					title: 'Actions',
					key: 'actions',
					scopedSlots: { customRender: 'actions' },
					width: 150,
				},
			],
		}
	},
	mounted() {
		this.loadTasks()
		this.loadExecutives()
		this.loadCustomers()
	},
	methods: {
		async loadTasks() {
			this.loading = true
			try {
				const params = {
					page: this.pagination.current,
					page_size: this.pagination.pageSize,
				}
				if (this.filters.status) params.status = this.filters.status
				if (this.filters.assigned_to) params.assigned_to = this.filters.assigned_to
				if (this.filters.priority) params.priority = this.filters.priority
				if (this.searchText) params.search = this.searchText

				const response = await taskAPI.getTasks(params)
				
				// Handle different response structures
				let tasksData = []
				let totalCount = 0
				
				// Axios automatically parses JSON, so response.data should be the parsed object
				if (response && response.data) {
					const data = response.data
					
					// Check if response.data is directly an array (most common case)
					if (Array.isArray(data)) {
						tasksData = data
						totalCount = data.length
					} 
					// Check if it's wrapped in results (DRF pagination)
					else if (data.results && Array.isArray(data.results)) {
						tasksData = data.results
						totalCount = data.count || data.total || data.results.length
					} 
					// Check if it's wrapped in data
					else if (data.data && Array.isArray(data.data)) {
						tasksData = data.data
						totalCount = data.total || data.data.length
					}
					// If it's an object but not an array, log it for debugging
					else if (typeof data === 'object' && data !== null) {
						console.warn('Unexpected response structure:', data)
						// Try to extract any array-like structure
						for (const key in data) {
							if (Array.isArray(data[key])) {
								tasksData = data[key]
								totalCount = data[key].length
								break
							}
						}
					}
				}
				
				// Ensure tasks is always an array and contains only task objects
				this.tasks = Array.isArray(tasksData) 
					? tasksData.filter(item => item && typeof item === 'object' && item.id !== undefined)
					: []
				
				// Update pagination
				this.pagination.total = totalCount
				
				// Organize tasks by status for Kanban view
				if (this.viewType === 'kanban') {
					this.organizeTasksByStatus()
				}
			} catch (error) {
				console.error('Error loading tasks:', error)
				this.$message.error('Failed to load tasks: ' + (error.response?.data?.detail || error.message || 'Unknown error'))
				// Reset to empty array on error
				this.tasks = []
				this.pagination.total = 0
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
			} finally {
				this.loadingCustomers = false
			}
		},
		handleTableChange(pagination, filters, sorter) {
			this.pagination.current = pagination.current
			this.pagination.pageSize = pagination.pageSize
			// Note: Sorting is handled client-side by Ant Design Vue
			this.loadTasks()
		},
		handleSearch(value) {
			// Handle both direct value and event
			if (value !== undefined && value !== null) {
				this.searchText = value
			}
			this.pagination.current = 1
			this.loadTasks()
		},
		showCreateModal() {
			this.editingTask = null
			this.modalTitle = 'Create Task'
			this.modalVisible = true
			this.$nextTick(() => {
				this.taskForm.resetFields()
			})
		},
		showEditModal(record) {
			this.editingTask = record
			this.modalTitle = 'Edit Task'
			this.modalVisible = true
			this.$nextTick(() => {
				this.taskForm.setFieldsValue({
					title: record.title,
					task_type: record.task_type,
					assigned_to: record.assigned_to,
					customer: record.customer,
					company: record.company,
					due_date: record.due_date ? this.parseDateForPicker(record.due_date) : null,
					priority: record.priority,
					description: record.description,
				})
			})
		},
		handleCancel() {
			this.modalVisible = false
			this.editingTask = null
			this.taskForm.resetFields()
		},
		handleSubmit() {
			this.taskForm.validateFields(async (err, values) => {
				if (!err) {
					this.saving = true
					try {
						// Format due_date - ant-design-vue date picker returns moment object or null
						if (values.due_date) {
							// Check if it's a moment object (has format method)
							if (values.due_date && typeof values.due_date.format === 'function') {
								values.due_date = values.due_date.format('YYYY-MM-DD HH:mm:ss')
							} else if (values.due_date instanceof Date) {
								// If it's a Date object, format it
								values.due_date = this.formatDateTime(values.due_date)
							} else if (typeof values.due_date === 'string') {
								// If it's already a string, use it as is (but ensure proper format)
								// Convert to proper format if needed
								const date = new Date(values.due_date)
								if (!isNaN(date.getTime())) {
									values.due_date = this.formatDateTime(date)
								}
							}
						}

						let result
						if (this.editingTask) {
							result = await taskAPI.updateTask(this.editingTask.id, values)
							this.$message.success('Task updated successfully!')
						} else {
							result = await taskAPI.createTask(values)
							this.$message.success('Task created successfully!')
						}
						this.modalVisible = false
						this.editingTask = null
						this.taskForm.resetFields()
						// Reload tasks immediately
						this.loadTasks()
					} catch (error) {
						console.error('Error saving task:', error)
						const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to save task'
						this.$message.error(errorMessage)
					} finally {
						this.saving = false
					}
				}
			})
		},
		async markCompleted(taskId) {
			try {
				await taskAPI.markCompleted(taskId)
				this.$message.success('Task marked as completed!')
				this.loadTasks()
			} catch (error) {
				console.error('Error marking task as completed:', error)
				this.$message.error('Failed to mark task as completed')
			}
		},
		filterCustomerOption(input, option) {
			return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
		},
		formatDate(dateString) {
			if (!dateString) return '-'
			const date = new Date(dateString)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		},
		parseDateForPicker(dateString) {
			if (!dateString) return null
			// Ant Design Vue DatePicker expects moment objects
			// Since moment might not be globally available, we'll pass the date string
			// The picker should handle ISO date strings
			// If moment is available in the component, we could use it here
			try {
				// Return the date string - the picker will parse it
				// Or if we have access to moment, we could do: return moment(dateString)
				return dateString
			} catch (e) {
				return null
			}
		},
		formatDateTime(date) {
			if (!date) return null
			const d = date instanceof Date ? date : new Date(date)
			if (isNaN(d.getTime())) return null
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			const hours = String(d.getHours()).padStart(2, '0')
			const minutes = String(d.getMinutes()).padStart(2, '0')
			const seconds = String(d.getSeconds()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
		},
		organizeTasksByStatus() {
			const organized = {}
			this.statusOptions.forEach(status => {
				organized[status.value] = {
					leads: [],
					count: 0,
				}
			})
			
			this.tasks.forEach(task => {
				const status = task.status || 'pending'
				if (organized[status]) {
					organized[status].leads.push(task)
					organized[status].count++
				}
			})
			
			this.tasksByStatus = organized
		},
		getTasksCount(statusValue) {
			return (this.tasksByStatus[statusValue] && this.tasksByStatus[statusValue].count) || 0
		},
		getTasksForStatus(statusValue) {
			return (this.tasksByStatus[statusValue] && this.tasksByStatus[statusValue].leads) || []
		},
		onDragStart(event, task) {
			this.draggedTask = task
			event.dataTransfer.effectAllowed = 'move'
			event.dataTransfer.setData('text/html', task.id)
			event.currentTarget.style.opacity = '0.5'
		},
		onDragEnd(event) {
			event.currentTarget.style.opacity = '1'
		},
		async onDrop(event, newStatus) {
			event.preventDefault()
			if (!this.draggedTask) return
			
			// Don't update if dropped in same column
			if (this.draggedTask.status === newStatus) {
				this.draggedTask = null
				return
			}
			
			try {
				await taskAPI.updateTask(this.draggedTask.id, { status: newStatus })
				this.$message.success('Task status updated successfully!')
				this.loadTasks()
			} catch (error) {
				console.error('Error updating task status:', error)
				this.$message.error('Failed to update task status')
				this.loadTasks() // Reload to revert
			} finally {
				this.draggedTask = null
			}
		},
		getStatusColor(status) {
			const colors = {
				pending: 'orange',
				in_progress: 'blue',
				completed: 'green',
				cancelled: 'red',
			}
			return colors[status] || 'geekblue'
		},
		formatStatus(status) {
			if (!status) return '-'
			return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
		},
		getPriorityColor(priority) {
			const colors = {
				low: 'default',
				medium: 'blue',
				high: 'orange',
				urgent: 'red',
			}
			return colors[priority] || 'default'
		},
		formatPriority(priority) {
			if (!priority) return '-'
			return priority.charAt(0).toUpperCase() + priority.slice(1)
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

