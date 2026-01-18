<!-- 
	This is the sign in page, it uses the dashboard layout in: 
	"./layouts/Default.vue" .
 -->

<template>
	<div class="sign-in">
		
		<a-row type="flex" :gutter="[24,24]" justify="space-around" align="middle">

			<!-- Sign In Form Column -->
			<a-col :span="24" :md="12" :lg="{span: 12, offset: 0}" :xl="{span: 6, offset: 2}" class="col-form">
				<h1 class="mb-15">Sign In</h1>
				<h5 class="font-regular text-muted">Enter your email and password to sign in</h5>

				<!-- Sign In Form -->
				<a-form
					id="components-form-demo-normal-login"
					:form="form"
					class="login-form"
					@submit="handleSubmit"
					:hideRequiredMark="true"
				>
					<a-form-item class="mb-10" label="Email" :colon="false">
						<a-input 
						v-decorator="[
						'email',
						{ rules: [{ required: true, message: 'Please input your email!' }] },
						]" placeholder="Email" />
					</a-form-item>
					<a-form-item class="mb-5" label="Password" :colon="false">
						<a-input
						v-decorator="[
						'password',
						{ rules: [{ required: true, message: 'Please input your password!' }] },
						]" type="password" placeholder="Password" />
					</a-form-item>
					<a-form-item class="mb-10">
    					<a-switch v-model="rememberMe" /> Remember Me
					</a-form-item>
					<a-form-item>
						<a-button type="primary" block html-type="submit" class="login-form-button" :loading="loading">
							SIGN IN
						</a-button>
					</a-form-item>
				</a-form>
				<!-- / Sign In Form -->

				<!-- <p class="font-semibold text-muted">Don't have an account? <router-link to="/sign-in" class="font-bold text-dark">Sign Up</router-link></p> -->
			</a-col>
			<!-- / Sign In Form Column -->

			<!-- Sign In Image Column -->
			<a-col :span="24" :md="12" :lg="12" :xl="12" class="col-img">
				<img src="images/img-signin.jpg" alt="">
			</a-col>
			<!-- Sign In Image Column -->

		</a-row>
		
	</div>
</template>

<script>

	import { authAPI } from '../services/api'
	import messagingService from '../services/messaging'

	export default ({
		data() {
			return {
				// Binded model property for "Sign In Form" switch button for "Remember Me" .
				rememberMe: true,
				loading: false,
			}
		},
		beforeCreate() {
			// Creates the form and adds to it component's "form" property.
			this.form = this.$form.createForm(this, { name: 'normal_login' });
		},
		methods: {
			// Handles input validation after submission.
			async handleSubmit(e) {
				e.preventDefault();
				this.form.validateFields(async (err, values) => {
					if ( !err ) {
						this.loading = true
						try {
							const response = await authAPI.login(values.email, values.password)
							
							if (response.data && response.data.access) {
								// Store tokens
								localStorage.setItem('access_token', response.data.access)
								if (response.data.refresh) {
									localStorage.setItem('refresh_token', response.data.refresh)
								}
								
								// Store user data if available
								if (response.data.user) {
									localStorage.setItem('user', JSON.stringify(response.data.user))
								}
								
								this.$message.success('Login successful!')
								
								// Initialize Firebase messaging after successful login
								if (messagingService.isSupported()) {
									messagingService.initialize().then((success) => {
										if (success) {
											console.log('Firebase messaging initialized successfully')
										}
									})
								}
								
								// Redirect to dashboard
								this.$router.push('/dashboard')
							} else {
								this.$message.error('Invalid response from server')
							}
						} catch (error) {
							console.error('Login error:', error)
							const message = error.response?.data?.detail || error.response?.data?.message || 'Login failed. Please check your credentials.'
							this.$message.error(message)
						} finally {
							this.loading = false
						}
					}
				});
			},
		},
	})

</script>

<style lang="scss">
	body {
		background-color: #ffffff;
	}
</style>