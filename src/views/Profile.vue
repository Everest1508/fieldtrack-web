<!-- 
	This is the user profile page, it uses the dashboard layout in: 
	"./layouts/Dashboard.vue" .
 -->

<template>
	<div>

		<!-- Header Background Image -->
		<div class="profile-nav-bg" style="background-image: url('images/bg-profile.jpg')"></div>
		<!-- / Header Background Image -->

		<!-- User Profile Card -->
		<a-card :bordered="false" class="card-profile-head" :bodyStyle="{padding: 0,}">
			<template #title>
				<a-row type="flex" align="middle">
					<a-col :span="24" :md="12" class="col-info">
						<a-avatar :size="74" shape="square" :src="userData.avatar || null">
							<template v-if="!userData.avatar">
								{{ userInitials }}
							</template>
						</a-avatar>
						<div class="avatar-info">
							<h4 class="font-semibold m-0">{{ userDisplayName }}</h4>
							<p>{{ userRole }}</p>
						</div>
					</a-col>
				</a-row>
			</template>
		</a-card>
		<!-- User Profile Card -->

		<a-row type="flex" :gutter="24">

			<!-- Profile Information Column -->
			<a-col :span="24" :md="12" class="mb-24">

				<!-- Profile Information Card -->
				<CardProfileInformation></CardProfileInformation>
				<!-- / Profile Information Card -->

			</a-col>
			<!-- / Profile Information Column -->
			
			<!-- Notifications Column -->
			<a-col :span="24" :md="12" class="mb-24">
			
				<!-- Notifications Card -->
				<a-card :bordered="false" class="header-solid h-full">
					<template #title>
						<h6 class="font-semibold m-0">Notifications</h6>
					</template>
					<a-list :data-source="notifications" :loading="loadingNotifications">
						<a-empty v-if="!loadingNotifications && notifications.length === 0" description="No notifications" />
						<a-list-item slot="renderItem" slot-scope="notification">
							<a-list-item-meta>
								<a slot="title">{{ notification.title }}</a>
								<template slot="description">
									<div>
										<p style="margin: 0;">{{ notification.message }}</p>
										<small style="color: #8c8c8c;">{{ formatNotificationTime(notification.sent_at) }}</small>
									</div>
								</template>
								<a-avatar slot="avatar" :style="{ backgroundColor: getNotificationColor(notification.notification_type, notification.success) }">
									{{ getNotificationIcon(notification.notification_type) }}
								</a-avatar>
							</a-list-item-meta>
							<template slot="actions">
								<a-tag :color="notification.success ? 'green' : 'red'">
									{{ notification.success ? 'Sent' : 'Failed' }}
								</a-tag>
							</template>
						</a-list-item>
					</a-list>
				</a-card>
				<!-- / Notifications Card -->

			</a-col>
			<!-- / Notifications Column -->

		</a-row>

	</div>
</template>

<script>

	import CardProfileInformation from "../components/Cards/CardProfileInformation"
	import { authAPI, crmAPI } from "../services/api"

	export default ({
		components: {
			CardProfileInformation,
		},
		data() {
			return {
				// User data
				userData: {},
				loading: true,

				// Notifications
				notifications: [],
				loadingNotifications: false,
			}
		},
		computed: {
			userDisplayName() {
				if (this.userData.first_name || this.userData.last_name) {
					return `${this.userData.first_name || ''} ${this.userData.last_name || ''}`.trim() || this.userData.username || 'User'
				}
				return this.userData.username || this.userData.email || 'User'
			},
			userInitials() {
				const name = this.userDisplayName
				const parts = name.split(' ')
				if (parts.length >= 2) {
					return (parts[0][0] + parts[1][0]).toUpperCase()
				}
				return name.substring(0, 2).toUpperCase()
			},
			userRole() {
				if (this.userData.role) {
					return this.userData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
				}
				return 'Admin'
			}
		},
		mounted() {
			this.loadUserData()
			this.loadNotifications()
		},
		methods: {
			async loadUserData() {
				this.loading = true
				try {
					// Try to get user from localStorage first
					const storedUser = localStorage.getItem('user')
					if (storedUser) {
						this.userData = JSON.parse(storedUser)
					}

					// Fetch fresh user data from API
					const response = await authAPI.getCurrentUser()
					if (response.data) {
						this.userData = response.data
						localStorage.setItem('user', JSON.stringify(response.data))
					}
				} catch (error) {
					console.error('Error loading user data:', error)
					this.$message.error('Failed to load user data')
				} finally {
					this.loading = false
				}
			},
			async loadNotifications() {
				this.loadingNotifications = true
				try {
					const response = await crmAPI.getNotifications({ page_size: 10 })
					if (response.data && response.data.results) {
						this.notifications = response.data.results
					} else if (Array.isArray(response.data)) {
						this.notifications = response.data.slice(0, 10)
					}
				} catch (error) {
					console.error('Error loading notifications:', error)
					this.$message.error('Failed to load notifications')
				} finally {
					this.loadingNotifications = false
				}
			},
			getNotificationColor(type, success) {
				if (!success) return '#ff4d4f'
				const colors = {
					'followup_reminder': '#faad14',
					'visit_reminder': '#1890ff',
					'lead_update': '#52c41a',
					'system': '#722ed1',
				}
				return colors[type] || '#1890ff'
			},
			getNotificationIcon(type) {
				const icons = {
					'followup_reminder': '📅',
					'visit_reminder': '📍',
					'lead_update': '📈',
					'system': '🔔',
				}
				return icons[type] || '🔔'
			},
			formatNotificationTime(dateString) {
				if (!dateString) return 'N/A'
				const date = new Date(dateString)
				const now = new Date()
				const diffMs = now - date
				const diffMins = Math.floor(diffMs / 60000)
				const diffHours = Math.floor(diffMs / 3600000)
				const diffDays = Math.floor(diffMs / 86400000)
				
				if (diffMins < 1) return 'Just now'
				if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
				if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
				if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
			}
		},
	})

</script>

<style lang="scss">
</style>