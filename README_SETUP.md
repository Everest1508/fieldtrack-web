# Vue Admin Dashboard Setup

This Vue.js admin dashboard is integrated with the Django backend API.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd muse-vue-ant-design-dashboard
npm install
```

## Configuration

The API base URL is configured in `src/services/api.js`. By default, it's set to:
```
https://apifieldtrack.pythonanywhere.com/api
```

To change it, edit `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://apifieldtrack.pythonanywhere.com/api',
  // ...
})
```

## Running the Application

1. Start the Django backend server:
```bash
cd ../backend
python manage.py runserver 0.0.0.0:8000
```

2. Start the Vue development server:
```bash
cd muse-vue-ant-design-dashboard
npm run serve
```

The Vue app will be available at `http://localhost:8080`

## Authentication

1. Navigate to the Sign-In page
2. Use admin credentials (email and password)
3. After successful login, you'll be redirected to the dashboard

## API Endpoints Used

- `POST /api/auth/login/` - User authentication
- `GET /api/admin/dashboard/stats/` - Dashboard statistics
- `GET /api/admin/dashboard/visits/` - Field visits data
- `GET /api/admin/dashboard/leads/` - Leads data
- `GET /api/admin/dashboard/executives/` - Sales executives list
- `GET /api/admin/dashboard/charts/` - Chart data (visits, leads, sales overview)
- `GET /api/admin/dashboard/projects/` - Projects/visits table data
- `GET /api/admin/dashboard/orders/` - Orders/visits history

## Features

- Real-time dashboard statistics
- Interactive charts (bar and line charts)
- Field visits table
- Recent visits timeline
- Responsive design

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

