import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'https://apifieldtrack.pythonanywhere.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/#/sign-in'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login/', { email, password })
  },
  refresh: (refreshToken) => {
    return api.post('/auth/refresh/', { refresh: refreshToken })
  },
  getCurrentUser: () => {
    return api.get('/auth/me/')
  },
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => {
    return api.get('/admin/dashboard/stats/')
  },
  getVisits: (params = {}) => {
    return api.get('/admin/dashboard/visits/', { params })
  },
  getLeads: (params = {}) => {
    return api.get('/admin/dashboard/leads/', { params })
  },
  getExecutives: () => {
    return api.get('/admin/dashboard/executives/')
  },
  createExecutive: (data) => {
    return api.post('/admin/dashboard/executives/', data)
  },
  updateExecutive: (id, data) => {
    return api.put(`/admin/dashboard/executives/${id}/`, data)
  },
  getChartsData: (type = 'visits') => {
    return api.get('/admin/dashboard/charts/', { params: { type } })
  },
  getProjectsTable: () => {
    return api.get('/admin/dashboard/projects/')
  },
  getOrdersHistory: () => {
    return api.get('/admin/dashboard/orders/')
  },
  updateFCMToken: (token) => {
    return api.post('/admin/fcm-token/', { fcm_token: token })
  },
  getCustomers: (params = {}) => {
    return api.get('/admin/dashboard/customers/', { params })
  },
  getCustomReport: (filters) => {
    return api.post('/reports/custom/', filters)
  },
  exportReport: (params) => {
    // Convert array params to query string format for GET request
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].forEach(value => {
          queryParams.append(key, value)
        })
      } else if (params[key] !== null && params[key] !== undefined) {
        queryParams.append(key, params[key])
      }
    })
    
    return api.get(`/reports/export/?${queryParams.toString()}`, { 
      responseType: 'blob', // For file downloads
      headers: {
        'Accept': params.format === 'pdf' ? 'application/pdf' : 'text/csv'
      }
    })
  }
}

// CRM API
export const crmAPI = {
  getCustomers: (params = {}) => {
    return api.get('/customers/', { params })
  },
  getCustomer: (id) => {
    return api.get(`/customers/${id}/`)
  },
  updateCustomer: (id, data) => {
    return api.put(`/customers/${id}/`, data)
  },
  createCustomer: (data) => {
    return api.post('/customers/', data)
  },
  getLeads: (params = {}) => {
    return api.get('/leads/', { params })
  },
  getLead: (id) => {
    return api.get(`/leads/${id}/`)
  },
  updateLead: (id, data) => {
    return api.put(`/leads/${id}/`, data)
  },
  updateLeadStatus: (id, data) => {
    return api.patch(`/leads/${id}/update_status/`, data)
  },
  createLead: (data) => {
    return api.post('/leads/', data)
  },
  getFieldVisits: (params = {}) => {
    return api.get('/field-visits/', { params })
  },
  getNotifications: (params = {}) => {
    return api.get('/notifications/', { params })
  },
  getSystemNotifications: (params = {}) => {
    return api.get('/system-notifications/', { params })
  },
  // REMOVED: getSystemNotificationsUnreadCount - unread count is now calculated locally
  // This function is kept for backward compatibility but should not be called
  getSystemNotificationsUnreadCount: () => {
    console.warn('⚠️ DEPRECATED: getSystemNotificationsUnreadCount() should not be called. Unread count is calculated locally.')
    // Return a promise that resolves to 0 to prevent errors if old cached code calls it
    return Promise.resolve({ data: { unread_count: 0 } })
  },
  markSystemNotificationRead: (id) => {
    return api.post(`/system-notifications/${id}/mark_read/`)
  },
  markAllSystemNotificationsRead: () => {
    return api.post('/system-notifications/mark_all_read/')
  },
}

// Task API
export const taskAPI = {
  getTasks: (params = {}) => {
    return api.get('/tasks/', { params })
  },
  getTask: (id) => {
    return api.get(`/tasks/${id}/`)
  },
  createTask: (data) => {
    return api.post('/tasks/', data)
  },
  updateTask: (id, data) => {
    return api.patch(`/tasks/${id}/`, data)
  },
  deleteTask: (id) => {
    return api.delete(`/tasks/${id}/`)
  },
  markCompleted: (id) => {
    return api.post(`/tasks/${id}/mark_completed/`)
  }
}

export default api

