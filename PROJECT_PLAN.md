# Haryana Police Inventory Management System (Malkhana)

## Project Overview

A comprehensive web-based inventory management system designed for Haryana Police to manage equipment across districts, police stations, and Malkhana (stores). The system supports multi-level hierarchy, role-based access, and complete inventory lifecycle management.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Redux Toolkit + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT + Google OAuth 2.0 |
| PDF Generation | Puppeteer / PDFKit |
| Charts | Recharts / Chart.js |
| Deployment | Local Server (PM2 + Nginx) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                          │
│         (Full system access, all districts)             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  DISTRICT 1   │  │  DISTRICT 2   │  │  DISTRICT N   │
│  District Admin│  │  District Admin│  │  District Admin│
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
   ▼         ▼         ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│PS/Unit│ │PS/Unit│ │PS/Unit│ │PS/Unit│ │PS/Unit│ │PS/Unit│
│  TSI  │ │  TSI  │ │  TSI  │ │  TSI  │ │  TSI  │ │  TSI  │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
   │         │         │         │         │         │
   ▼         ▼         ▼         ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ MHC  │ │ MHC  │ │ MHC  │ │ MHC  │ │ MHC  │ │ MHC  │
│Keeper│ │Keeper│ │Keeper│ │Keeper│ │Keeper│ │Keeper│
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘

Inspection Officer - Cross-cutting role (can access all levels)
```

---

## Database Schema Design

### 1. User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  googleId: String (optional),
  fullName: String,
  role: Enum ['super_admin', 'district_admin', 'tsi', 'mhc_storekeeper', 'inspection_officer', 'unit'],
  district: ObjectId (ref: District),
  policeStation: ObjectId (ref: PoliceStation),
  store: ObjectId (ref: Store),
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. District Model
```javascript
{
  _id: ObjectId,
  name: String (e.g., "Gurugram", "Faridabad"),
  code: String (unique),
  admin: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date
}
```

### 3. PoliceStation Model
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  district: ObjectId (ref: District),
  type: Enum ['PS', 'unit'],
  inCharge: ObjectId (ref: User),
  address: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date
}
```

### 4. Store (Malkhana) Model
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  policeStation: ObjectId (ref: PoliceStation),
  storeKeeper: ObjectId (ref: User),
  location: String,
  capacity: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### 5. Category Model
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  description: String,
  parentCategory: ObjectId (ref: Category, optional),
  icon: String,
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Item Model
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  category: ObjectId (ref: Category),
  description: String,
  unit: Enum ['piece', 'pair', 'set', 'kg', 'liter', 'box'],
  minimumStock: Number,
  maximumStock: Number,
  reorderLevel: Number,
  unitPrice: Number,
  specifications: Mixed (e.g., {size: 'L', color: 'Black'}),
  imageUrl: String,
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Inventory Model (Stock at each store)
```javascript
{
  _id: ObjectId,
  store: ObjectId (ref: Store),
  item: ObjectId (ref: Item),
  quantity: Number,
  condition: Enum ['new', 'good', 'fair', 'poor', 'damaged'],
  lastUpdated: Date,
  batchNumber: String,
  manufacturingDate: Date,
  expiryDate: Date (if applicable),
  location: String (shelf/section in store),
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Data Isolation Middleware
```javascript
// Middleware to filter data based on user's assigned location
const dataIsolation = async (req, res, next) => {
  const user = req.user;
  
  // Super Admin and Inspection Officer can see all data
  if (['super_admin', 'inspection_officer'].includes(user.role)) {
    return next();
  }
  
  // District Admin can see all data under their district
  if (user.role === 'district_admin') {
    req.query.district = user.district;
    return next();
  }
  
  // Others can only see their assigned store/PS
  if (user.store) {
    req.query.store = user.store;
  } else if (user.policeStation) {
    req.query.policeStation = user.policeStation;
  }
  
  next();
};
```

### 9. Transaction Model
```javascript
{
  _id: ObjectId,
  type: Enum ['receive', 'issue', 'return', 'transfer', 'damage', 'disposal', 'adjustment'],
  item: ObjectId (ref: Item),
  fromStore: ObjectId (ref: Store),
  toStore: ObjectId (ref: Store),
  quantity: Number,
  condition: Enum ['new', 'good', 'fair', 'poor', 'damaged'],
  referenceNumber: String,
  issuedTo: {
    name: String,
    designation: String,
    badgeNumber: String
  },
  reason: String,
  approvedBy: ObjectId (ref: User),
  status: Enum ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
  documents: [String],
  remarks: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Demand Model
```javascript
{
  _id: ObjectId,
  demandNumber: String (auto-generated),
  requestedBy: ObjectId (ref: User),
  store: ObjectId (ref: Store),
  items: [{
    item: ObjectId (ref: Item),
    quantity: Number,
    urgency: Enum ['low', 'medium', 'high', 'critical'],
    reason: String
  }],
  status: Enum ['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected'],
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Inspection Model
```javascript
{
  _id: ObjectId,
  inspectionNumber: String (auto-generated),
  inspector: ObjectId (ref: User),
  store: ObjectId (ref: Store),
  type: Enum ['routine', 'special', 'annual'],
  findings: String,
  items: [{
    item: ObjectId (ref: Item),
    inspectedQuantity: Number,
    expectedQuantity: Number,
    discrepancy: Number,
    condition: Enum ['new', 'good', 'fair', 'poor', 'damaged'],
    remarks: String
  }],
  overallStatus: Enum ['satisfactory', 'needs_attention', 'critical'],
  recommendations: String,
  reportUrl: String,
  inspectedAt: Date,
  createdAt: Date
}
```

### 11. AuditLog Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  action: Enum ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject'],
  entity: String,
  entityId: ObjectId,
  oldValues: Mixed,
  newValues: Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

---

## API Endpoints Design

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with credentials
POST   /api/auth/google            - Google OAuth login
POST   /api/auth/logout            - Logout
POST   /api/auth/forgot-password   - Send reset email
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/me                 - Get current user
```

### Users
```
GET    /api/users                   - List users (filtered by role & district)
GET    /api/users/:id               - Get user details
POST   /api/users                   - Create user (District Admin only)
PUT    /api/users/:id               - Update user
DELETE /api/users/:id               - Delete user (District Admin only)
PUT    /api/users/:id/status        - Activate/Deactivate user
```
**Note**: 
- District Admin can only manage users within their own district
- District Admin can add/delete TSI, MHC Store Keeper, and Unit users
- Super Admin can manage all users across all districts

### Districts
```
GET    /api/districts               - List all districts
GET    /api/districts/:id           - Get district details
POST   /api/districts               - Create district
PUT    /api/districts/:id           - Update district
DELETE /api/districts/:id           - Delete district
GET    /api/districts/:id/stats     - Get district statistics
```

### Police Stations
```
GET    /api/police-stations         - List police stations
GET    /api/police-stations/:id     - Get PS details
POST   /api/police-stations         - Create police station
PUT    /api/police-stations/:id     - Update PS
DELETE /api/police-stations/:id     - Delete PS
GET    /api/police-stations/:id/stats - Get PS statistics
```

### Stores (Malkhana)
```
GET    /api/stores                  - List stores
GET    /api/stores/:id              - Get store details
POST   /api/stores                  - Create store
PUT    /api/stores/:id              - Update store
DELETE /api/stores/:id              - Delete store
GET    /api/stores/:id/inventory    - Get store inventory
GET    /api/stores/:id/stats        - Get store statistics
```

### Categories
```
GET    /api/categories              - List all categories
GET    /api/categories/:id          - Get category details
POST   /api/categories              - Create category
PUT    /api/categories/:id          - Update category
DELETE /api/categories/:id          - Delete category
```

### Items
```
GET    /api/items                   - List all items
GET    /api/items/:id               - Get item details
POST   /api/items                   - Create item
PUT    /api/items/:id               - Update item
DELETE /api/items/:id               - Delete item
GET    /api/items/low-stock         - Get low stock items
```

### Inventory
```
GET    /api/inventory               - List inventory records
GET    /api/inventory/:id           - Get inventory details
POST   /api/inventory               - Add inventory record
PUT    /api/inventory/:id           - Update inventory
GET    /api/inventory/store/:storeId - Get inventory by store
GET    /api/inventory/item/:itemId  - Get inventory by item
```

### Transactions
```
GET    /api/transactions            - List transactions
GET    /api/transactions/:id        - Get transaction details
POST   /api/transactions/receive    - Receive items
POST   /api/transactions/issue      - Issue items
POST   /api/transactions/return     - Return items
POST   /api/transactions/transfer   - Transfer items
POST   /api/transactions/damage     - Report damage
POST   /api/transactions/dispose    - Dispose items
PUT    /api/transactions/:id/approve - Approve transaction
PUT    /api/transactions/:id/reject  - Reject transaction
```

### Demands
```
GET    /api/demands                 - List demands
GET    /api/demands/:id             - Get demand details
POST   /api/demands                 - Create demand
PUT    /api/demands/:id             - Update demand
PUT    /api/demands/:id/submit      - Submit demand
PUT    /api/demands/:id/approve     - Approve demand
PUT    /api/demands/:id/reject      - Reject demand
PUT    /api/demands/:id/fulfill     - Fulfill demand
```

### Inspections
```
GET    /api/inspections             - List inspections
GET    /api/inspections/:id         - Get inspection details
POST   /api/inspections             - Create inspection
PUT    /api/inspections/:id         - Update inspection
GET    /api/inspections/store/:storeId - Get inspections by store
```

### Reports
```
GET    /api/reports/stock-summary   - Stock summary report
GET    /api/reports/stock-health    - Stock health report
GET    /api/reports/demand-ranking  - Demand ranking report
GET    /api/reports/category-breakdown - Category breakdown
GET    /api/reports/audit-trail     - Audit trail report
GET    /api/reports/forecast        - Demand forecast
GET    /api/reports/pdf/:type       - Generate PDF report
```

---

## Frontend Pages Structure

### Authentication Pages
```
/login                    - Login page
/forgot-password          - Forgot password page
/reset-password           - Reset password page
```

### Dashboard Pages
```
/dashboard                - Main dashboard (role-based)
/dashboard/district/:id   - District dashboard
/dashboard/store/:id      - Store dashboard
```

### Inventory Management Pages
```
/inventory                - Inventory list
/inventory/:storeId       - Store inventory
/inventory/item/:itemId   - Item inventory details
/inventory/add            - Add new inventory
```

### Item Management Pages
```
/items                    - Items list
/items/add                - Add new item
/items/:id                - Item details
/items/:id/edit           - Edit item
```

### Category Management Pages
```
/categories               - Categories list
/categories/add           - Add category
/categories/:id/edit      - Edit category
```

### Transaction Pages
```
/transactions             - Transactions list
/transactions/receive     - Receive items
/transactions/issue       - Issue items
/transactions/return      - Return items
/transactions/transfer    - Transfer items
/transactions/:id         - Transaction details
```

### Demand Pages
```
/demands                  - Demands list
/demands/create           - Create demand
/demands/:id              - Demand details
/demands/:id/edit         - Edit demand
```

### Inspection Pages
```
/inspections              - Inspections list
/inspections/create       - Create inspection
/inspections/:id          - Inspection details
/inspections/:id/edit     - Edit inspection
```

### Reports Pages
```
/reports                  - Reports dashboard
/reports/stock-summary    - Stock summary report
/reports/stock-health     - Stock health report
/reports/demand-ranking   - Demand ranking report
/reports/audit-trail      - Audit trail report
/reports/forecast         - Demand forecast
```

### Administration Pages
```
/admin/users              - User management (District Admin only)
/admin/districts          - District management (Super Admin only)
/admin/police-stations    - Police station management (District Admin)
/admin/stores             - Store management (District Admin)
/admin/settings           - System settings (Super Admin only)
```
**Note**: District Admin can only add/delete users within their district.

---

## Role-Based Access Control (RBAC)

### Data Isolation Rule
**Each user can ONLY access inventory data for their assigned location (store/police station).** No user can view or modify inventory from other locations except Super Admin and Inspection Officer.

### Super Admin
- Full access to all modules
- Manage all districts, police stations, stores
- Manage all users
- System settings
- All reports
- Cross-district inventory visibility

### District Admin
- **Can add/delete users** under their district only
- Manage district's police stations and stores
- View inventory for ALL stores under their district
- Approve/reject demands from PS under district
- View district reports
- Create users for district

### PS In-charge / TSI
- Manage police station's store
- View ONLY their police station's inventory
- Create demands for their PS
- Approve demands from MHC Store Keeper under their PS
- View PS reports
- Cannot see other PS inventory

### MHC Store Keeper
- Manage ONLY their assigned store's inventory
- Process transactions (receive, issue, return) for their store
- View store reports
- Update item conditions
- Cannot see other stores' inventory

### Inspection Officer
- Conduct inspections at any store
- View inventory data for inspected stores
- Generate inspection reports
- View audit trail
- Read-only access to inventory

### Unit
- Similar to PS In-charge but for unit level
- View ONLY their unit's store inventory
- Limited to unit's store operations

---

## Project Structure

```
haryana-police-inventory/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                  # Images, icons
│   │   ├── components/              # Reusable components
│   │   │   ├── common/              # Button, Input, Modal, etc.
│   │   │   ├── layout/              # Header, Sidebar, Footer
│   │   │   ├── inventory/           # Inventory components
│   │   │   ├── transactions/        # Transaction components
│   │   │   └── charts/              # Chart components
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── inventory/           # Inventory pages
│   │   │   ├── items/               # Item pages
│   │   │   ├── categories/          # Category pages
│   │   │   ├── transactions/        # Transaction pages
│   │   │   ├── demands/             # Demand pages
│   │   │   ├── inspections/         # Inspection pages
│   │   │   ├── reports/             # Report pages
│   │   │   └── admin/               # Admin pages
│   │   ├── redux/                   # Redux store
│   │   │   ├── slices/              # Redux slices
│   │   │   └── store.js             # Store configuration
│   │   ├── services/                # API services
│   │   ├── hooks/                   # Custom hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── routes/                  # Route definitions
│   │   ├── App.js                   # Main App component
│   │   └── index.js                 # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── passport.js              # Passport config
│   │   └── env.js                   # Environment variables
│   ├── controllers/                 # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── districtController.js
│   │   ├── policeStationController.js
│   │   ├── storeController.js
│   │   ├── categoryController.js
│   │   ├── itemController.js
│   │   ├── inventoryController.js
│   │   ├── transactionController.js
│   │   ├── demandController.js
│   │   ├── inspectionController.js
│   │   └── reportController.js
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                  # Authentication middleware
│   │   ├── rbac.js                  # Role-based access
│   │   ├── audit.js                 # Audit logging
│   │   ├── validator.js             # Request validation
│   │   └── errorHandler.js          # Error handling
│   ├── models/                      # Mongoose models
│   │   ├── User.js
│   │   ├── District.js
│   │   ├── PoliceStation.js
│   │   ├── Store.js
│   │   ├── Category.js
│   │   ├── Item.js
│   │   ├── Inventory.js
│   │   ├── Transaction.js
│   │   ├── Demand.js
│   │   ├── Inspection.js
│   │   └── AuditLog.js
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── districts.js
│   │   ├── policeStations.js
│   │   ├── stores.js
│   │   ├── categories.js
│   │   ├── items.js
│   │   ├── inventory.js
│   │   ├── transactions.js
│   │   ├── demands.js
│   │   ├── inspections.js
│   │   └── reports.js
│   ├── utils/                       # Utility functions
│   │   ├── pdfGenerator.js
│   │   ├── emailService.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── seeds/                       # Database seeds
│   │   └── seedData.js
│   ├── server.js                    # Entry point
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                     # Root package.json (scripts)
```

---

## Implementation Phases

### Phase 1: Project Setup (Day 1)
- [ ] Initialize MERN project structure
- [ ] Set up MongoDB connection
- [ ] Configure Express server
- [ ] Set up React with Redux Toolkit
- [ ] Configure Tailwind CSS
- [ ] Set up authentication (JWT + Google OAuth)

### Phase 2: Core Models & API (Day 2-3)
- [ ] Create all Mongoose models
- [ ] Implement authentication endpoints
- [ ] Implement CRUD for Districts, PS, Stores
- [ ] Implement Category management
- [ ] Implement Item management
- [ ] Add validation and error handling

### Phase 3: Inventory Management (Day 4-5)
- [ ] Inventory CRUD operations
- [ ] Transaction management (receive, issue, return)
- [ ] Inter-station transfer workflow
- [ ] Damage/Loss tracking
- [ ] Stock level alerts

### Phase 4: Demand & Approval System (Day 6)
- [ ] Demand creation and management
- [ ] Multi-level approval workflow
- [ ] Demand fulfillment tracking
- [ ] Rejection and return handling

### Phase 5: Frontend - Auth & Dashboard (Day 7-8)
- [ ] Login/Register pages
- [ ] Role-based routing
- [ ] Dashboard with statistics
- [ ] Charts and visualizations

### Phase 6: Frontend - Core Features (Day 9-11)
- [ ] Inventory management pages
- [ ] Item and Category management pages
- [ ] Transaction pages
- [ ] Demand pages
- [ ] Store management pages

### Phase 7: Reporting & Analytics (Day 12-13)
- [ ] Stock summary reports
- [ ] Stock health reports
- [ ] Demand ranking reports
- [ ] Audit trail
- [ ] PDF export
- [ ] Demand forecasting

### Phase 8: Inspection Module (Day 14)
- [ ] Inspection creation and management
- [ ] Inspection checklist
- [ ] Discrepancy reporting
- [ ] Inspection reports

### Phase 9: Admin & User Management (Day 15)
- [ ] User management pages
- [ ] District/PS/Store administration
- [ ] System settings
- [ ] Bulk operations

### Phase 10: Testing & Deployment (Day 16-17)
- [ ] Unit testing
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Deployment to local server
- [ ] Documentation

---

## Key Features Summary

### 1. Multi-Level Hierarchy
- District → Police Station/Unit → Store/MHC
- Role-based access at each level
- **Data Isolation**: Each user can ONLY see their own store's inventory
- District Admin can manage users within their district

### 2. Complete Inventory Lifecycle
- Receive → Store → Issue → Return
- Transfer between locations
- Damage tracking and disposal
- Condition monitoring

### 3. Demand Management
- Create demands with urgency levels
- Multi-level approval workflow
- Track fulfillment status
- Rejection handling with reasons

### 4. Inspection Module
- Routine and special inspections
- Physical verification against system records
- Discrepancy reporting
- Recommendations tracking

### 5. Comprehensive Reporting
- Real-time dashboard
- Stock health analysis
- Demand forecasting
- Audit trail for compliance
- PDF export for official use

### 6. District-Level User Management
- District Admin can add new users (TSI, MHC Store Keeper, Unit)
- District Admin can delete users from their district
- District Admin can activate/deactivate users
- User assignments to PS and Store
- Audit trail for all user management actions

### 7. Editable Categories
- Add custom categories
- Edit existing categories
- Hierarchical category support
- Category-wise analytics

### 8. Data Isolation
- Each user can ONLY see inventory for their assigned store/police station
- No cross-store inventory visibility (except Super Admin)
- API middleware enforces data isolation at backend level
- Frontend filters data based on user's assigned location
- Audit trail tracks all data access attempts

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Google OAuth** - SSO integration
3. **Role-Based Access Control** - Granular permissions
4. **Data Isolation** - Each user sees ONLY their store's inventory
5. **Audit Logging** - Track all changes
6. **Data Validation** - Input sanitization
7. **Rate Limiting** - Prevent abuse
8. **CORS Configuration** - Secure API access
9. **Password Hashing** - bcrypt encryption
10. **District-level User Management** - District Admin can add/delete users in their district only

---

## Default Seed Data

### Categories
1. Riot Gear
   - Laathi/Danda
   - Helmet
   - Body Protector
   - Reflector Jacket
   - Shield
2. Cleaning Materials
   - Brooms
   - Mops
   - Disinfectants
   - Cleaning Chemicals
3. Uniforms
   - Khaki Uniform
   - Winter Jacket
   - Boots
   - Belt
   - Badges
4. Medical Supplies
   - First Aid Kit
   - Bandages
   - Antiseptic
5. Communication Equipment
   - Walkie Talkie
   - Radio Set
   - Batteries
6. Office Supplies
   - Stationery
   - Forms
   - Files

### Default Admin User
- Username: admin
- Password: admin123
- Role: super_admin

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/haryana-police-inventory

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
CLIENT_URL=http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

---

## Scripts

### Root Package.json
```json
{
  "scripts": {
    "server": "cd server && npm run dev",
    "client": "cd client && npm start",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "seed": "cd server && node seeds/seedData.js",
    "build": "cd client && npm run build",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  }
}
```

---

## Success Metrics

1. **User Adoption** - All districts using the system
2. **Data Accuracy** - 99% inventory accuracy
3. **Response Time** - < 2 seconds page load
4. **Uptime** - 99.5% availability
5. **Audit Coverage** - 100% transactions logged

---

*Document Version: 1.0*
*Last Updated: January 2026*
