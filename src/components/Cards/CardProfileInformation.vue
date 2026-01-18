<template>

	<!-- Profile Information Card -->
	<a-card :bordered="false" class="header-solid h-full card-profile-information" :bodyStyle="{paddingTop: 0, paddingBottom: '16px' }" :headStyle="{paddingRight: 0,}">
		<template #title>
			<h6 class="font-semibold m-0">Profile Information</h6>
		</template>
		<a-button type="link" slot="extra">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path class="fill-muted" d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z" fill="#111827"/>
				<path class="fill-muted" d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z" fill="#111827"/>
			</svg>
		</a-button>
		<p class="text-dark" v-if="userData.bio">
			{{ userData.bio }}
		</p>
		<p class="text-dark" v-else>
			Welcome to your profile page. Manage your account settings and view your activity here.
		</p>
		<hr class="my-25">
		<a-descriptions :title="userDisplayName" :column="1">
			<a-descriptions-item label="Full Name">
				{{ userDisplayName }}
			</a-descriptions-item>
			<a-descriptions-item label="Username">
				{{ userData.username || 'N/A' }}
			</a-descriptions-item>
			<a-descriptions-item label="Email">
				{{ userData.email || 'N/A' }}
			</a-descriptions-item>
			<a-descriptions-item label="Phone" v-if="userData.phone">
				{{ userData.phone }}
			</a-descriptions-item>
			<a-descriptions-item label="Role">
				{{ userRole }}
			</a-descriptions-item>
			<a-descriptions-item label="Member Since" v-if="userData.date_joined">
				{{ formatDate(userData.date_joined) }}
			</a-descriptions-item>
		</a-descriptions>
	</a-card>
	<!-- / Profile Information Card -->

</template>

<script>

	import { authAPI } from '../../services/api'

	export default ({
		data() {
			return {
				userData: {},
			}
		},
		computed: {
			userDisplayName() {
				if (this.userData.first_name || this.userData.last_name) {
					return `${this.userData.first_name || ''} ${this.userData.last_name || ''}`.trim() || this.userData.username || 'User'
				}
				return this.userData.username || this.userData.email || 'User'
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
		},
		methods: {
			async loadUserData() {
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
				}
			},
			formatDate(dateString) {
				if (!dateString) return 'N/A'
				const date = new Date(dateString)
				return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
			}
		},
	})

</script>