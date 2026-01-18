<template>
	
	<!-- Main Sidebar -->
	<component :is="navbarFixed ? 'a-affix' : 'div'" :offset-top="top">

		<!-- Layout Header -->
		<a-layout-header>
			<a-row type="flex">

				<!-- Header Breadcrumbs & Title Column -->
				<a-col :span="24" :md="6">

					<!-- Header Breadcrumbs -->
					<a-breadcrumb>
						<a-breadcrumb-item><router-link to="/"> Pages</router-link></a-breadcrumb-item>
						<a-breadcrumb-item>{{ this.$route.name }}</a-breadcrumb-item>
					</a-breadcrumb>
					<!-- / Header Breadcrumbs -->

					<!-- Header Page Title -->
					<div class="ant-page-header-heading">
						<span class="ant-page-header-heading-title">{{ this.$route.name }}</span>
					</div>
					<!-- / Header Page Title -->

				</a-col>
				<!-- / Header Breadcrumbs & Title Column -->

				<!-- Header Control Column -->
				<a-col :span="24" :md="18" class="header-control">

					<!-- Header Control Buttons -->
					<!-- Notification Permission Button -->
					<a-button 
						v-if="showNotificationButton" 
						type="primary" 
						size="small"
						@click="requestNotificationPermission"
						:loading="requestingPermission"
						title="Click to enable browser notifications"
						style="margin-right: 8px;"
					>
						<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
							<path d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z" fill="white"/>
							<path d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z" fill="white"/>
						</svg>
						Enable Notifications
					</a-button>
					<a-dropdown :trigger="['click']" overlayClassName="header-notifications-dropdown" :getPopupContainer="() => wrapper">
						<a-badge :count="unreadCount" :overflow-count="99">
							<a class="ant-dropdown-link" @click="e => e.preventDefault()">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M10 2C6.68632 2 4.00003 4.68629 4.00003 8V11.5858L3.29292 12.2929C3.00692 12.5789 2.92137 13.009 3.07615 13.3827C3.23093 13.7564 3.59557 14 4.00003 14H16C16.4045 14 16.7691 13.7564 16.9239 13.3827C17.0787 13.009 16.9931 12.5789 16.7071 12.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z" fill="#111827"/>
									<path d="M10 18C8.34315 18 7 16.6569 7 15H13C13 16.6569 11.6569 18 10 18Z" fill="#111827"/>
								</svg>
							</a>
						</a-badge>
						
						<template slot="overlay">
							<a-card :bordered="false" style="width: 360px; max-height: 400px; overflow-y: auto;">
								<template #title>
									<div style="display: flex; justify-content: space-between; align-items: center;">
										<span>Notifications</span>
										<a-button type="link" size="small" @click="markAllRead" :loading="markingAllRead">
											Mark all as read
										</a-button>
									</div>
								</template>
								<a-spin :spinning="loadingNotifications">
									<a-empty v-if="!loadingNotifications && systemNotifications.length === 0" description="No notifications" />
									<a-list :data-source="systemNotifications" item-layout="horizontal">
										<a-list-item slot="renderItem" slot-scope="notification" :class="{'notification-unread': !notification.is_read}">
											<a-list-item-meta @click.native="handleNotificationClick(notification)">
												<template slot="description">
													<div>
														<p style="margin: 0; color: #8c8c8c;">{{ notification.message }}</p>
														<small style="color: #bfbfbf;">{{ notification.time_ago }}</small>
													</div>
												</template>
												<a slot="title" @click.prevent="handleNotificationClick(notification)" :style="{ fontWeight: notification.is_read ? 'normal' : 'bold' }">
													{{ notification.title }}
												</a>
												<a-avatar slot="avatar" :style="{ backgroundColor: getNotificationColor(notification.notification_type) }">
													{{ getNotificationIcon(notification.notification_type) }}
												</a-avatar>
											</a-list-item-meta>
										</a-list-item>
									</a-list>
								</a-spin>
							</a-card>
						</template>
					</a-dropdown>
					<a-button type="link" ref="secondarySidebarTriggerBtn" @click="$emit('toggleSettingsDrawer', true)">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M11.4892 3.17094C11.1102 1.60969 8.8898 1.60969 8.51078 3.17094C8.26594 4.17949 7.11045 4.65811 6.22416 4.11809C4.85218 3.28212 3.28212 4.85218 4.11809 6.22416C4.65811 7.11045 4.17949 8.26593 3.17094 8.51078C1.60969 8.8898 1.60969 11.1102 3.17094 11.4892C4.17949 11.7341 4.65811 12.8896 4.11809 13.7758C3.28212 15.1478 4.85218 16.7179 6.22417 15.8819C7.11045 15.3419 8.26594 15.8205 8.51078 16.8291C8.8898 18.3903 11.1102 18.3903 11.4892 16.8291C11.7341 15.8205 12.8896 15.3419 13.7758 15.8819C15.1478 16.7179 16.7179 15.1478 15.8819 13.7758C15.3419 12.8896 15.8205 11.7341 16.8291 11.4892C18.3903 11.1102 18.3903 8.8898 16.8291 8.51078C15.8205 8.26593 15.3419 7.11045 15.8819 6.22416C16.7179 4.85218 15.1478 3.28212 13.7758 4.11809C12.8896 4.65811 11.7341 4.17949 11.4892 3.17094ZM10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" fill="#111827"/>
						</svg>
					</a-button>
					<a-button type="link" class="sidebar-toggler" @click="$emit('toggleSidebar', ! sidebarCollapsed) , resizeEventHandler()">
						<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/></svg>
					</a-button>
					<a-button type="link" class="btn-logout" @click="handleLogout" title="Logout">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4V16C2 16.5523 2.44772 17 3 17H9C9.55228 17 10 17.4477 10 18C10 18.5523 9.55228 19 9 19H3C1.34315 19 0 17.6569 0 16V4C0 2.34315 1.34315 1 3 1H9C9.55228 1 10 1.44772 10 2C10 2.55228 9.55228 3 9 3H3ZM13.7071 6.29289C13.3166 5.90237 12.6834 5.90237 12.2929 6.29289C11.9024 6.68342 11.9024 7.31658 12.2929 7.70711L14.5858 10H6C5.44772 10 5 10.4477 5 11C5 11.5523 5.44772 12 6 12H14.5858L12.2929 14.2929C11.9024 14.6834 11.9024 15.3166 12.2929 15.7071C12.6834 16.0976 13.3166 16.0976 13.7071 15.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929L13.7071 6.29289Z" fill="#111827"/>
						</svg>
						<span style="margin-left: 4px;">Logout</span>
					</a-button>
					<!-- / Header Control Buttons -->

					<!-- Header Search Input -->
					<a-input-search class="header-search" :class="searchLoading ? 'loading' : ''" placeholder="Type here…" @search="onSearch" :loading='searchLoading'>
						<svg slot="prefix" width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 9.29583 13.5892 10.4957 12.8907 11.4765L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L11.4765 12.8907C10.4957 13.5892 9.29583 14 8 14C4.68629 14 2 11.3137 2 8Z" fill="#111827"/>
						</svg>
					</a-input-search>
					<!-- / Header Search Input -->

				</a-col>
				<!-- / Header Control Column -->

			</a-row>
		</a-layout-header>
		<!--  /Layout Header -->

	</component>
	<!-- / Main Sidebar -->

</template>

<script>


	import messagingService from '@/services/messaging'
	import { authAPI, crmAPI } from '@/services/api'

	export default ({
		props: {
			// Header fixed status.
			navbarFixed: {
				type: Boolean,
				default: false,
			},

			// Sidebar collapsed status.
			sidebarCollapsed: {
				type: Boolean,
				default: false,
			},

		},
		data() {
			return {
				// Fixed header/sidebar-footer ( Affix component ) top offset.
				top: 0,

				// Search input loading status.
				searchLoading: false,

				// The wrapper element to attach dropdowns to.
				wrapper: document.body,

				// Notification permission status
				notificationPermission: 'default',
				requestingPermission: false,

				// System notifications
				systemNotifications: [],
				loadingNotifications: false,
				unreadCount: 0,
				markingAllRead: false,
				notificationsLoaded: false, // Track if notifications have been loaded
			}
		},
		computed: {
			showNotificationButton() {
				// Show button if notifications are supported and permission is not granted
				const isSupported = messagingService.isSupported()
				const notGranted = this.notificationPermission !== 'granted'
				return isSupported && notGranted
			}
		},
		methods: {
			resizeEventHandler(){
				this.top = this.top ? 0 : -0.01 ;
				// To refresh the header if the window size changes.
				// Reason for the negative value is that it doesn't activate the affix unless
				// scroller is anywhere but the top of the page.
			},
			onSearch(value){
			},
			async requestNotificationPermission() {
				this.requestingPermission = true
				try {
					console.log('User clicked notification permission button')
					
					// Check if browser supports notifications
					if (!('Notification' in window)) {
						this.$message.error('This browser does not support notifications')
						return
					}
					
					// Check if service worker is supported
					if (!('serviceWorker' in navigator)) {
						this.$message.error('This browser does not support service workers (required for notifications)')
						return
					}
					
					const success = await messagingService.initialize()
					if (success) {
						this.$message.success('Notifications enabled successfully!')
						this.checkNotificationPermission()
					} else {
						// Check if permission was denied
						if (Notification.permission === 'denied') {
							this.$message.warning('Notifications were blocked. Please enable them in your browser settings.')
						} else {
							this.$message.warning('Failed to enable notifications. Please try again.')
						}
						this.checkNotificationPermission()
					}
				} catch (error) {
					console.error('Error requesting notification permission:', error)
					const errorMessage = error.message || 'An error occurred while enabling notifications.'
					
					if (errorMessage.includes('denied')) {
						this.$message.warning('Notifications were blocked. Please enable them in your browser settings.')
					} else {
						this.$message.error(errorMessage)
					}
					this.checkNotificationPermission()
				} finally {
					this.requestingPermission = false
				}
			},
			checkNotificationPermission() {
				if ('Notification' in window) {
					this.notificationPermission = Notification.permission
					console.log('Notification permission status:', this.notificationPermission)
					
					// If permission was previously denied, show a helpful message
					if (this.notificationPermission === 'denied') {
						console.warn('Notifications are blocked. User needs to enable them in browser settings.')
					}
				} else {
					this.notificationPermission = 'not-supported'
					console.warn('Notifications are not supported in this browser')
				}
			},
			async loadSystemNotifications() {
				// Prevent duplicate calls - use global flag to prevent multiple component instances
				if (this.loadingNotifications || this.notificationsLoaded || window.__notificationsLoading) {
					console.log('Skipping duplicate notification load:', {
						loadingNotifications: this.loadingNotifications,
						notificationsLoaded: this.notificationsLoaded,
						globalLoading: window.__notificationsLoading
					})
					return
				}
				
				console.log('Loading system notifications (ONCE on page load)')
				// Set global flag to prevent concurrent calls
				window.__notificationsLoading = true
				this.loadingNotifications = true
				try {
					const response = await crmAPI.getSystemNotifications({ page_size: 10 })
					if (response.data && response.data.results) {
						this.systemNotifications = response.data.results
					} else if (Array.isArray(response.data)) {
						this.systemNotifications = response.data.slice(0, 10)
					}
					
					// Calculate unread count from loaded notifications (NO separate API call)
					this.unreadCount = this.systemNotifications.filter(n => !n.is_read).length
					this.notificationsLoaded = true
					console.log('Notifications loaded successfully. Unread count:', this.unreadCount)
				} catch (error) {
					console.error('Error loading system notifications:', error)
				} finally {
					this.loadingNotifications = false
					window.__notificationsLoading = false
				}
			},
			async handleNotificationClick(notification) {
				if (!notification.is_read) {
					try {
						await crmAPI.markSystemNotificationRead(notification.id)
						notification.is_read = true
						// Update unread count locally (no API call needed)
						this.unreadCount = this.systemNotifications.filter(n => !n.is_read).length
					} catch (error) {
						console.error('Error marking notification as read:', error)
					}
				}
				
				// Navigate to link if provided
				if (notification.link) {
					this.$router.push(notification.link)
				}
			},
			async markAllRead() {
				this.markingAllRead = true
				try {
					await crmAPI.markAllSystemNotificationsRead()
					// Update all notifications to read
					this.systemNotifications.forEach(n => {
						n.is_read = true
					})
					// Update unread count locally (no API call needed)
					this.unreadCount = 0
					this.$message.success('All notifications marked as read')
				} catch (error) {
					console.error('Error marking all as read:', error)
					this.$message.error('Failed to mark all as read')
				} finally {
					this.markingAllRead = false
				}
			},
			getNotificationColor(type) {
				const colors = {
					'new_lead': '#52c41a',
					'new_visit': '#1890ff',
					'followup_due': '#faad14',
					'lead_status_change': '#722ed1',
					'visit_reminder': '#1890ff',
					'system': '#722ed1',
					'info': '#1890ff',
				}
				return colors[type] || '#1890ff'
			},
			getNotificationIcon(type) {
				const icons = {
					'new_lead': '📈',
					'new_visit': '📍',
					'followup_due': '📅',
					'lead_status_change': '🔄',
					'visit_reminder': '⏰',
					'system': '🔔',
					'info': 'ℹ️',
				}
				return icons[type] || '🔔'
			},
			handleLogout() {
				this.$confirm({
					title: 'Logout',
					content: 'Are you sure you want to logout?',
					onOk: () => {
						// Call logout API
						authAPI.logout()
						
						// Clear user data
						localStorage.removeItem('user')
						
						// Show success message
						this.$message.success('Logged out successfully')
						
						// Redirect to sign-in page
						this.$router.push('/sign-in')
					},
					onCancel: () => {
						// User cancelled
					},
				})
			}
		},
		mounted: function(){
			// Set the wrapper to the proper element, layout wrapper.
			this.wrapper = document.getElementById('layout-dashboard') ;
			// Check notification permission status
			this.checkNotificationPermission()
			
			// Load system notifications only once globally (prevent duplicate calls from multiple instances)
			if (!window.__notificationsLoaded) {
				this.loadSystemNotifications()
				window.__notificationsLoaded = true
			} else {
				// If already loaded elsewhere, just get the data from storage or skip
				this.notificationsLoaded = true
			}
			
			// Listen for system notification events from FCM (only register once globally)
			if (!window.__fcmNotificationHandlerRegistered) {
				this.fcmNotificationHandler = () => {
					// Refresh notifications when a new one is received via FCM
					// Reset flags to allow reloading
					window.__notificationsLoaded = false
					this.notificationsLoaded = false
					this.loadSystemNotifications()
				}
				window.addEventListener('system-notification-received', this.fcmNotificationHandler)
				window.__fcmNotificationHandlerRegistered = true
			}
		},
		beforeDestroy() {
			// Remove event listener to prevent memory leaks
			if (this.fcmNotificationHandler) {
				window.removeEventListener('system-notification-received', this.fcmNotificationHandler)
			}
		},
		created() {
			// Registering window resize event listener to fix affix elements size
			// error while resizing.
			window.addEventListener("resize", this.resizeEventHandler);
		},
		destroyed() {
			// Removing window resize event listener.
			window.removeEventListener("resize", this.resizeEventHandler);
		},
	})

</script>

<style lang="scss" scoped>
.notification-unread {
	background-color: #f0f7ff;
	border-left: 3px solid #1890ff;
}
</style>

<style lang="scss">
.header-notifications-dropdown {
	.ant-card-body {
		padding: 0;
	}
	
	.ant-list-item {
		cursor: pointer;
		transition: background-color 0.3s;
		
		&:hover {
			background-color: #f5f5f5;
		}
	}
}
</style>
