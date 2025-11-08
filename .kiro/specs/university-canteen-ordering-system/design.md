# Design Document

## Overview

ระบบสั่งอาหารออนไลน์สำหรับโรงอาหารมหาวิทยาลัยเป็น web application ที่พัฒนาด้วย React และ CSS โดยใช้สถาปัตยกรรมแบบ client-server ระบบประกอบด้วย 3 ส่วนหลัก:

1. **Frontend (React)**: Single Page Application (SPA) ที่รองรับ responsive design สำหรับทุกอุปกรณ์
2. **Backend API**: RESTful API สำหรับจัดการ business logic และ data processing
3. **Database**: เก็บข้อมูลผู้ใช้, เมนู, คำสั่งซื้อ, และธุรกรรม

ระบบใช้ธีมสีน้ำเงิน-ขาว พร้อม animations ที่ทำให้การใช้งานราบรื่นและน่าสนใจ

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser<br/>React SPA]
    end
    
    subgraph "Application Layer"
        API[API Gateway<br/>REST API]
        Auth[Authentication<br/>Service]
        Order[Order<br/>Service]
        Menu[Menu<br/>Service]
        Payment[Payment<br/>Service]
        Notification[Notification<br/>Service]
    end
    
    subgraph "Data Layer"
        DB[(Database<br/>PostgreSQL)]
        Cache[(Redis Cache)]
        FileStorage[File Storage<br/>Images]
    end
    
    subgraph "External Services"
        PaymentGateway[Payment Gateway<br/>QR/Debit Card]
    end
    
    Web -->|HTTPS| API
    API --> Auth
    API --> Order
    API --> Menu
    API --> Payment
    API --> Notification
    
    Auth --> DB
    Order --> DB
    Menu --> DB
    Payment --> DB
    
    Menu --> FileStorage
    Order --> Cache
    Menu --> Cache
    
    Payment --> PaymentGateway
```

### Technology Stack

**Frontend:**
- React 18+ (UI framework)
- React Router (navigation)
- Context API / Redux (state management)
- Axios (HTTP client)
- CSS Modules / Styled Components (styling)
- React Query (data fetching & caching)
- i18next (internationalization for Thai/English)

**Backend:**
- Node.js with Express.js (API server)
- Mongoose (MongoDB ODM)
- JWT (authentication)
- bcrypt (password hashing)
- Socket.io (real-time notifications)

**Database:**
- MongoDB Atlas (primary database)
- Redis (caching & session management)

**File Storage:**
- AWS S3 / Local storage (menu item images)

**Payment Integration:**
- Payment Gateway API (QR Code & Debit Card)

### Deployment Architecture

- Frontend: Hosted on CDN (Vercel/Netlify) or web server
- Backend: Node.js server (AWS EC2 / DigitalOcean)
- Database: MongoDB Atlas (cloud-hosted)
  - Connection: `mongodb+srv://jackeiei101_db_user:1234@deliveryfood.ntp7snv.mongodb.net/DeliveryFood?retryWrites=true&w=majority`
- Redis: Managed Redis instance
- Load Balancer: For handling concurrent users (500+)

## Components and Interfaces

### Frontend Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Notification.jsx
│   │   └── Loading.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── Navigation.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── menu/
│   │   ├── MenuList.jsx
│   │   ├── MenuItem.jsx
│   │   ├── MenuDetail.jsx
│   │   ├── MenuFilter.jsx
│   │   └── MenuSearch.jsx
│   ├── cart/
│   │   ├── Cart.jsx
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   ├── order/
│   │   ├── OrderForm.jsx
│   │   ├── OrderList.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── OrderStatus.jsx
│   │   └── OrderHistory.jsx
│   ├── payment/
│   │   ├── PaymentMethod.jsx
│   │   ├── QRPayment.jsx
│   │   └── CardPayment.jsx
│   ├── vendor/
│   │   ├── VendorDashboard.jsx
│   │   ├── MenuManagement.jsx
│   │   ├── OrderQueue.jsx
│   │   ├── SalesReport.jsx
│   │   └── PopularMenus.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── UserManagement.jsx
│       ├── VendorManagement.jsx
│       └── SystemReports.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── MenuPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrderTrackingPage.jsx
│   ├── ProfilePage.jsx
│   ├── VendorPage.jsx
│   └── AdminPage.jsx
├── contexts/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── LanguageContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useOrders.js
│   └── useNotifications.js
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── menuService.js
│   ├── orderService.js
│   └── paymentService.js
├── utils/
│   ├── constants.js
│   ├── validators.js
│   └── formatters.js
└── styles/
    ├── theme.css
    ├── animations.css
    └── responsive.css
```

### Backend API Structure

```
server/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── menuController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── vendorController.js
│   └── adminController.js
├── models/
│   ├── User.js (Mongoose schema)
│   ├── Vendor.js (Mongoose schema)
│   ├── MenuItem.js (Mongoose schema)
│   ├── Order.js (Mongoose schema)
│   ├── Payment.js (Mongoose schema)
│   └── Notification.js (Mongoose schema)
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── vendorRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── validationMiddleware.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── services/
│   ├── emailService.js
│   ├── notificationService.js
│   ├── paymentService.js
│   └── reportService.js
├── utils/
│   ├── jwt.js
│   ├── encryption.js
│   └── validators.js
└── config/
    ├── database.js (MongoDB connection)
    ├── redis.js
    └── payment.js
```

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Menu:**
- `GET /api/menus` - Get all menu items (with filters)
- `GET /api/menus/:id` - Get menu item details
- `GET /api/vendors/:vendorId/menus` - Get menus by vendor
- `POST /api/menus` - Create menu item (vendor only)
- `PUT /api/menus/:id` - Update menu item (vendor only)
- `DELETE /api/menus/:id` - Delete menu item (vendor only)

**Orders:**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (vendor only)
- `GET /api/vendor/orders` - Get vendor's orders

**Payment:**
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:orderId` - Get payment details

**Vendor:**
- `GET /api/vendor/dashboard` - Get vendor dashboard data
- `GET /api/vendor/sales` - Get sales reports
- `GET /api/vendor/popular-menus` - Get popular menu items
- `PUT /api/vendor/status` - Toggle order acceptance

**Admin:**
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/vendors` - Get all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `PUT /api/admin/vendors/:id/suspend` - Suspend vendor
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/reports` - Get system reports

### Real-time Events (Socket.io)

**Customer Events:**
- `order:status_updated` - Order status changed
- `order:ready` - Order is ready for pickup

**Vendor Events:**
- `order:new` - New order received
- `order:cancelled` - Order cancelled by customer

**Admin Events:**
- `system:alert` - System alerts

## Data Models

### User Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['customer', 'vendor', 'admin']),
  firstName: String,
  lastName: String,
  phone: String,
  status: String (enum: ['active', 'suspended', 'banned']),
  language: String (enum: ['th', 'en'], default: 'th'),
  createdAt: Date,
  updatedAt: Date
}
```

### Vendor Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  shopName: String (required),
  description: String,
  logo: String (image URL),
  status: String (enum: ['pending', 'approved', 'suspended']),
  isAcceptingOrders: Boolean (default: true),
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    // ... other days
  },
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  vendorId: ObjectId (ref: 'Vendor'),
  name: String (required),
  nameEn: String,
  description: String,
  descriptionEn: String,
  price: Number (required),
  image: String (image URL),
  category: String,
  allergenInfo: String,
  isAvailable: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User'),
  vendorId: ObjectId (ref: 'Vendor'),
  orderNumber: String (unique),
  status: String (enum: ['pending_payment', 'paid', 'preparing', 'ready', 'completed', 'cancelled']),
  items: [{
    menuItemId: ObjectId (ref: 'MenuItem'),
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  pickupTime: Date,
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: 'Order'),
  amount: Number,
  method: String (enum: ['qr_code', 'debit_card']),
  status: String (enum: ['pending', 'success', 'failed']),
  transactionId: String,
  gatewayResponse: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model (MongoDB Schema)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  type: String (enum: ['order_status', 'payment', 'system']),
  title: String,
  message: String,
  isRead: Boolean (default: false),
  relatedOrderId: ObjectId (ref: 'Order', optional),
  createdAt: Date
}
```

### MongoDB Collections Diagram

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o| Vendor : owns
    User ||--o{ Notification : receives
    Vendor ||--o{ MenuItem : has
    Vendor ||--o{ Order : receives
    Order ||--|| Payment : has
    
    User {
        ObjectId _id PK
        string username
        string email
        string password
        string role
        string firstName
        string lastName
        string phone
        string status
        string language
        date createdAt
        date updatedAt
    }
    
    Vendor {
        ObjectId _id PK
        ObjectId userId FK
        string shopName
        string description
        string logo
        string status
        boolean isAcceptingOrders
        object operatingHours
        date createdAt
        date updatedAt
    }
    
    MenuItem {
        ObjectId _id PK
        ObjectId vendorId FK
        string name
        string nameEn
        string description
        string descriptionEn
        number price
        string image
        string category
        string allergenInfo
        boolean isAvailable
        date createdAt
        date updatedAt
    }
    
    Order {
        ObjectId _id PK
        ObjectId customerId FK
        ObjectId vendorId FK
        string orderNumber
        string status
        array items
        number totalAmount
        date pickupTime
        string specialRequests
        date createdAt
        date updatedAt
    }
    
    Payment {
        ObjectId _id PK
        ObjectId orderId FK
        number amount
        string method
        string status
        string transactionId
        object gatewayResponse
        date createdAt
        date updatedAt
    }
    
    Notification {
        ObjectId _id PK
        ObjectId userId FK
        string type
        string title
        string message
        boolean isRead
        ObjectId relatedOrderId
        date createdAt
    }
```

## UI/UX Design

### Color Theme

**Primary Colors:**
- Primary Blue: `#1E40AF` (main actions, headers)
- Light Blue: `#3B82F6` (hover states, accents)
- Sky Blue: `#60A5FA` (backgrounds, cards)
- White: `#FFFFFF` (backgrounds, text on dark)
- Off-White: `#F9FAFB` (secondary backgrounds)

**Secondary Colors:**
- Success Green: `#10B981` (success messages, completed orders)
- Warning Yellow: `#F59E0B` (warnings, pending states)
- Error Red: `#EF4444` (errors, cancellations)
- Gray: `#6B7280` (secondary text, borders)

### Typography

- **Headings**: Prompt (Thai-friendly), sans-serif
- **Body**: Inter, Sarabun (for Thai), sans-serif
- **Font Sizes**: 
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Animations

**Transition Durations:**
- Fast: 200ms (button hover, input focus)
- Medium: 300ms (modal open/close, dropdown)
- Slow: 400ms (page transitions, complex animations)

**Animation Types:**
- Fade in/out for modals and notifications
- Slide in from right for cart sidebar
- Scale up for buttons on hover
- Skeleton loading for content
- Smooth scroll for navigation
- Ripple effect for touch interactions

### Key UI Components

**1. Navigation Header**
- Logo on the left
- Language toggle (TH/EN)
- Cart icon with badge showing item count
- User profile dropdown
- Responsive hamburger menu for mobile

**2. Menu Card**
- Food image (aspect ratio 4:3)
- Menu name (bilingual)
- Price with currency
- Allergen info icon
- Add to cart button with animation
- Hover effect: scale up slightly, show shadow

**3. Cart Sidebar**
- Slides in from right
- List of cart items with quantity controls
- Subtotal calculation
- Checkout button (sticky at bottom)
- Empty cart illustration when no items

**4. Order Status Timeline**
- Visual progress indicator
- Status icons with colors
- Estimated time for each stage
- Real-time updates with animation

**5. Vendor Dashboard**
- Order queue cards
- Quick stats (today's orders, revenue)
- Menu management table
- Sales chart

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Page Layouts

**Customer Flow:**
1. Home → Browse Menus → Menu Details → Add to Cart → Checkout → Payment → Order Tracking
2. Profile → Order History → Reorder

**Vendor Flow:**
1. Dashboard → Order Queue → Update Status
2. Menu Management → Add/Edit Menu
3. Reports → Sales & Popular Items

**Admin Flow:**
1. Dashboard → System Overview
2. User Management → Ban/Unban
3. Vendor Management → Approve/Suspend
4. Reports → System-wide Analytics

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Display user-friendly error messages
- Retry mechanism for failed requests (max 3 attempts)
- Offline mode detection with notification
- Fallback to cached data when available

**Validation Errors:**
- Real-time form validation
- Clear error messages below input fields
- Prevent form submission until valid
- Highlight invalid fields in red

**Payment Errors:**
- Clear error messages from payment gateway
- Option to retry payment
- Automatic order status rollback on payment failure
- Contact support information

### Backend Error Handling

**Error Response Format:**
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details: {} // Optional additional information
  }
}
```

**Error Types:**
- `VALIDATION_ERROR` - Invalid input data
- `AUTHENTICATION_ERROR` - Invalid credentials or token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate resource or constraint violation
- `PAYMENT_ERROR` - Payment processing failed
- `SERVER_ERROR` - Internal server error

**Error Logging:**
- Log all errors with timestamp, user ID, and stack trace
- Send critical errors to monitoring service (e.g., Sentry)
- Store error logs for debugging and analysis

### Database Error Handling

- MongoDB connection pool management with retry logic
- Mongoose transaction support for multi-document operations
- Unique constraint violation handling
- Connection timeout and retry mechanism
- Automatic reconnection on connection loss

### Payment Gateway Error Handling

- Timeout handling (30 seconds max)
- Automatic failover to backup gateway
- Transaction status verification
- Idempotency for payment requests

## Security Considerations

### Authentication & Authorization

**JWT Implementation:**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Secure HTTP-only cookies for tokens
- Token blacklist for logout

**Password Security:**
- bcrypt hashing with salt rounds = 12
- Minimum password length: 8 characters
- Password complexity requirements
- Rate limiting on login attempts (5 attempts per 15 minutes)

**Role-Based Access Control (RBAC):**
- Customer: Can order, view own orders, manage profile
- Vendor: Can manage own menus, view own orders, update order status
- Admin: Full system access

### Data Protection

**Encryption:**
- TLS 1.3 for all API communications
- Database encryption at rest
- Encrypted storage for sensitive data (passwords, payment info)

**Input Validation:**
- Sanitize all user inputs
- Parameterized queries to prevent SQL injection
- XSS protection with Content Security Policy
- CSRF tokens for state-changing operations

**Rate Limiting:**
- API rate limit: 100 requests per minute per user
- Login attempts: 5 per 15 minutes
- Order creation: 10 per hour per user
- Payment attempts: 3 per order

### Payment Security

- PCI DSS compliance for payment handling
- No storage of full card numbers
- Tokenization for payment methods
- 3D Secure authentication for card payments
- Transaction verification and fraud detection

### Privacy

- GDPR/PDPA compliance
- User consent for data collection
- Data retention policy (1 year for orders)
- Right to data deletion
- Privacy policy and terms of service

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- Lazy loading for routes
- Dynamic imports for heavy components
- Separate bundles for vendor and app code

**Asset Optimization:**
- Image compression and lazy loading
- WebP format with fallback
- CDN for static assets
- Minification of CSS and JavaScript

**Caching Strategy:**
- Service Worker for offline support
- Browser caching for static assets
- React Query for API response caching
- LocalStorage for user preferences

**Performance Targets:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse score: > 90

### Backend Optimization

**Database Optimization:**
- MongoDB indexes on frequently queried fields (userId, vendorId, status, email)
- Compound indexes for complex queries
- Connection pooling (max 20 connections)
- Query optimization with explain()
- Pagination for large result sets (20 items per page)
- Lean queries for read-only operations

**Caching Strategy:**
- Redis cache for:
  - Menu items (TTL: 5 minutes)
  - User sessions (TTL: 15 minutes)
  - Popular menus (TTL: 1 hour)
- Cache invalidation on data updates

**API Optimization:**
- Response compression (gzip)
- Efficient JSON serialization
- Batch operations where possible
- Async processing for non-critical tasks (emails, notifications)

### Scalability

**Horizontal Scaling:**
- Stateless API servers
- Load balancer for traffic distribution
- MongoDB Atlas auto-scaling and sharding
- Redis cluster for distributed caching

**Monitoring:**
- Application performance monitoring (APM)
- Database query performance tracking
- Error rate monitoring
- User analytics and behavior tracking

## Testing Strategy

### Unit Testing

**Frontend (Jest + React Testing Library):**
- Component rendering tests
- User interaction tests (clicks, form inputs)
- State management tests
- Utility function tests
- Coverage target: > 70%

**Backend (Jest + Supertest):**
- Controller logic tests
- Service function tests
- Middleware tests
- Utility function tests
- Coverage target: > 80%

**Test Examples:**
```javascript
// Frontend component test
describe('MenuItem Component', () => {
  it('should display menu item details correctly', () => {
    const menuItem = { name: 'Pad Thai', price: 50, image: 'url' };
    render(<MenuItem item={menuItem} />);
    expect(screen.getByText('Pad Thai')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
  
  it('should add item to cart when button clicked', () => {
    const onAddToCart = jest.fn();
    render(<MenuItem item={menuItem} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAddToCart).toHaveBeenCalledWith(menuItem);
  });
});

// Backend API test
describe('POST /api/orders', () => {
  it('should create order successfully', async () => {
    const orderData = {
      vendorId: 'vendor-123',
      items: [{ menuItemId: 'item-1', quantity: 2 }],
      pickupTime: '2025-11-06T12:00:00Z'
    };
    
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.order).toHaveProperty('id');
  });
});
```

### Integration Testing

**API Integration Tests:**
- End-to-end API workflows
- Database integration
- External service integration (payment gateway)
- Authentication flow testing

**Test Scenarios:**
1. Complete order flow: Register → Login → Browse → Add to Cart → Checkout → Payment → Track Order
2. Vendor workflow: Login → Receive Order → Update Status → View Reports
3. Admin workflow: Login → Manage Users → Approve Vendors → View Reports

### End-to-End Testing (Cypress/Playwright)

**Critical User Journeys:**
1. **Customer Order Journey:**
   - Navigate to menu page
   - Search and filter menus
   - Add items to cart
   - Proceed to checkout
   - Select pickup time
   - Complete payment
   - Verify order confirmation

2. **Vendor Order Management:**
   - Login as vendor
   - View incoming orders
   - Update order status
   - Verify customer notification

3. **Admin Management:**
   - Login as admin
   - Approve pending vendor
   - View system reports
   - Ban problematic user

**Browser Testing:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)

### Performance Testing

**Load Testing (Artillery/k6):**
- Simulate 500 concurrent users
- Test API response times under load
- Database query performance
- Payment gateway integration under load

**Stress Testing:**
- Identify breaking point
- Test system recovery
- Monitor resource usage (CPU, memory, database connections)

**Performance Metrics:**
- API response time: < 2 seconds (95th percentile)
- Database query time: < 100ms (average)
- Page load time: < 3 seconds
- Time to interactive: < 3 seconds

### Security Testing

**Vulnerability Scanning:**
- OWASP Top 10 testing
- SQL injection testing
- XSS testing
- CSRF testing
- Authentication bypass testing

**Penetration Testing:**
- Manual security testing
- Automated security scans (OWASP ZAP)
- Third-party security audit (recommended)

**Security Checklist:**
- [ ] All inputs validated and sanitized
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure password storage
- [ ] JWT token security
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Payment data encrypted

### Accessibility Testing

**WCAG 2.1 AA Compliance:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- Alt text for images
- ARIA labels

**Testing Tools:**
- axe DevTools
- Lighthouse accessibility audit
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS)

### User Acceptance Testing (UAT)

**Test Groups:**
- Students (primary users)
- Faculty/Staff
- Vendors
- Administrators

**UAT Scenarios:**
- Real-world usage scenarios
- Usability feedback
- Performance feedback
- Bug identification

## Deployment Strategy

### Development Environment

- Local development with hot reload
- Mock payment gateway
- Seed data for testing
- Debug logging enabled

### Staging Environment

- Production-like environment
- Real payment gateway (test mode)
- Performance monitoring
- User acceptance testing

### Production Environment

- Load balanced servers
- Database replication
- Redis cluster
- CDN for static assets
- Real payment gateway
- Monitoring and alerting
- Automated backups

### CI/CD Pipeline

```mermaid
graph LR
    A[Code Push] --> B[Run Tests]
    B --> C{Tests Pass?}
    C -->|Yes| D[Build]
    C -->|No| E[Notify Developer]
    D --> F[Deploy to Staging]
    F --> G[Run E2E Tests]
    G --> H{Tests Pass?}
    H -->|Yes| I[Deploy to Production]
    H -->|No| E
    I --> J[Health Check]
    J --> K{Healthy?}
    K -->|Yes| L[Complete]
    K -->|No| M[Rollback]
```

**Pipeline Steps:**
1. Code commit triggers pipeline
2. Run linting and unit tests
3. Build application
4. Deploy to staging
5. Run integration and E2E tests
6. Manual approval for production
7. Deploy to production with zero downtime
8. Run smoke tests
9. Monitor for errors

### Monitoring and Logging

**Application Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Uptime monitoring (Pingdom)
- User analytics (Google Analytics)

**Logging:**
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized log management (ELK Stack)
- Log retention: 30 days

**Alerts:**
- Error rate > 1%
- Response time > 3 seconds
- Database connection failures
- Payment gateway failures
- Server CPU/Memory > 80%

## Internationalization (i18n)

### Language Support

**Supported Languages:**
- Thai (th)
- English (en)

**Translation Files Structure:**
```javascript
// en.json
{
  "common": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout"
  },
  "menu": {
    "addToCart": "Add to Cart",
    "price": "Price",
    "allergenInfo": "Allergen Information"
  },
  "order": {
    "status": {
      "pending": "Pending Payment",
      "paid": "Paid",
      "preparing": "Preparing",
      "ready": "Ready for Pickup",
      "completed": "Completed"
    }
  }
}

// th.json
{
  "common": {
    "login": "เข้าสู่ระบบ",
    "register": "ลงทะเบียน",
    "logout": "ออกจากระบบ"
  },
  "menu": {
    "addToCart": "เพิ่มลงตะกร้า",
    "price": "ราคา",
    "allergenInfo": "ข้อมูลการแพ้อาหาร"
  },
  "order": {
    "status": {
      "pending": "รอชำระเงิน",
      "paid": "ชำระเงินแล้ว",
      "preparing": "กำลังเตรียม",
      "ready": "พร้อมรับ",
      "completed": "เสร็จสิ้น"
    }
  }
}
```

**Implementation:**
- Use i18next library
- Language detection from browser/user preference
- Persistent language selection
- RTL support (if needed in future)
- Date/time formatting per locale
- Currency formatting

## Future Enhancements

**Phase 2 Features:**
- Mobile app (React Native)
- Push notifications
- Loyalty program and rewards
- Rating and review system
- Advanced analytics dashboard
- Inventory management for vendors
- Promotional campaigns and discounts
- Multiple pickup locations
- Delivery option
- Integration with university ID card system

**Technical Improvements:**
- GraphQL API option
- Microservices architecture
- Kubernetes deployment
- Machine learning for menu recommendations
- Chatbot for customer support
- Progressive Web App (PWA) features
