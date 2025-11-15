# University Canteen Ordering System

ระบบสั่งอาหารออนไลน์สำหรับโรงอาหารมหาวิทยาลัย - Online Food Ordering System for University Canteen

## Features

- 🔐 User Authentication (Customer, Vendor, Admin roles)
- 🍔 Menu Management with search and filters
- 🛒 Shopping Cart functionality
- 📦 Order Management with real-time status updates
- 💳 Payment Integration (QR Code & Debit Card)
- 📊 Sales Reports and Analytics for Vendors
- 👥 Admin Dashboard for system management
- 🌐 Multi-language support (Thai/English)
- 📱 Responsive design for all devices

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB (Atlas)
- JWT Authentication
- Socket.io (Real-time updates)
- Express Rate Limit
- Helmet.js (Security)

### Frontend
- React 18
- React Router
- React Query (TanStack Query)
- i18next (Internationalization)
- Axios
- CSS3 (Blue & White Theme)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (connection string provided)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd university-canteen-ordering-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# The .env file already contains MongoDB connection string
# You can modify other settings if needed
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL if backend runs on different port
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menus` - Get all menu items (with filters)
- `GET /api/menus/:id` - Get menu item details
- `POST /api/menus` - Create menu item (vendor only)
- `PUT /api/menus/:id` - Update menu item (vendor only)
- `DELETE /api/menus/:id` - Delete menu item (vendor only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (vendor only)
- `GET /api/orders/vendor/orders` - Get vendor's orders

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment (webhook)
- `GET /api/payments/:orderId` - Get payment details
- `POST /api/payments/mock-success` - Mock payment success (testing only)

### Vendor
- `POST /api/vendors` - Create vendor profile
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor profile
- `PUT /api/vendors/status/toggle` - Toggle order acceptance
- `GET /api/vendors/dashboard/stats` - Get dashboard statistics
- `GET /api/vendors/reports/sales` - Get sales report
- `GET /api/vendors/reports/popular-menus` - Get popular menus

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/vendors` - Get all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `PUT /api/admin/vendors/:id/suspend` - Suspend vendor
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/reports` - Get system reports

## Demo Accounts

For testing purposes, use these pre-configured accounts:

### Admin Account 👨‍💼
```
Email:    admin@test.com
Password: admin123
```
**Capabilities:**
- Manage all users
- Manage all vendors
- View system reports
- Monitor all orders

### Vendor Account 🏪
```
Email:    vendor1@test.com
Password: password123
Shop:     ร้านอาหารทดสอบ 1
Location: โรงอาหารกลาง
```
**Capabilities:**
- Manage menu items
- View incoming orders
- Update order status
- View sales reports

### Customer Account 👤
```
Email:    customer1@test.com
Password: password123
```
**Capabilities:**
- Browse menu items
- Search and filter menus
- Add items to cart
- Place orders
- Track order status
- Manage shop profile

### Admin Account 👨‍💼
```
Email:    admin@test.com
Password: password123
Username: admin1
```
**Capabilities:**
- Manage all users (3 accounts)
- Approve/suspend vendors
- View system reports
- Manage all orders
- System-wide statistics

## Default User Roles

You can register users with different roles:
- `customer` - Can browse menu, order food, track orders
- `vendor` - Can manage menus, view orders, update order status
- `admin` - Full system access, user management, vendor approval

## Project Structure

```
university-canteen-ordering-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── i18n/        # Translations
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── styles/      # CSS files
│   └── index.html
└── README.md
```

## Development Status

### Completed Features ✅
- User authentication and authorization
- Role-based access control
- Menu CRUD operations with search/filter
- Order creation and management
- Payment integration (mock)
- Vendor dashboard and reports
- Admin management features
- Security features (rate limiting, validation)
- Frontend layout and navigation
- Shopping cart functionality
- Multi-language support (i18n)

### In Progress 🚧
- Real-time notifications (Socket.io)
- Image upload for menu items
- Advanced filtering and search
- Order tracking interface
- Vendor order queue management
- Complete payment gateway integration

### Planned Features 📋
- Mobile app (React Native)
- Push notifications
- Rating and review system
- Loyalty program
- Advanced analytics
- Inventory management

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- XSS protection
- CORS configuration
- Helmet.js security headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.

---

Made with ❤️ for University Canteen
