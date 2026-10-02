# EventHub – Online Event Booking System

> A production-ready, full-stack event booking platform built with React, Node.js, Express, MongoDB, Tailwind CSS, and Razorpay payment integration.

---

## 📌 Project Overview

**EventHub** provides an end-to-end event discovery, reservation, and management platform for live concerts, technical conferences, hands-on workshops, sports tournaments, and standup comedy events.

The platform includes two dedicated user roles (**Customer** and **Administrator**), real-time seat availability tracking, cryptographic Razorpay payment verification, instant digital QR pass generation, user booking cancellation rules, and an executive administration console with revenue charts and event CRUD management.

---

## 🚀 Key Features

### 👤 User Capabilities
- **Account Registration & Login**: Client-side and server-side validation, password hashing with `bcryptjs`, JWT persistent sessions, duplicate email protection at both database & API levels.
- **Event Discovery**: Search by keyword/venue/city, filter by 8 categories, filter by date (Today, This Weekend, Upcoming), sort by price and event date.
- **Detailed Event View**: High-resolution imagery, venue location, schedule, transparent pricing, dynamic ticket quantity selector, and live seat capacity indicators.
- **Seamless Booking & Payment**:
  - Direct integration with Razorpay Payment Gateway.
  - Backend HMAC SHA-256 cryptographic signature verification.
  - Zero-overbooking atomic seat decrementing.
- **Digital QR Pass**: Instant booking confirmation with encrypted QR code pass, download & print capabilities.
- **My Bookings & Cancellation**: History of all reservations, live status tracking (`Confirmed`, `Pending`, `Cancelled`), and automated seat restoration on cancellation.
- **Profile Management**: Update name, phone, and password with security verification.

### 🛡️ Administrator Capabilities
- **Protected Admin Console**: Role-based access control (`adminOnly` middleware) and isolated admin login portal.
- **Executive Analytics Dashboard**:
  - Real-time revenue statistics.
  - Booking status counters (Confirmed, Pending, Cancelled).
  - Monthly revenue growth area chart and category breakdown bar chart (via Recharts).
  - Recent transactions table.
- **Event Management**: Create, edit, monitor capacity, and safely delete events (auto-cancels active events to protect audit records).
- **Booking Management**: Audit all platform bookings with status overrides and filter controls.
- **User Management**: View registered attendees, registration timestamps, and toggle account activation status without password exposure.
- **Payment Audits**: Comprehensive transaction log with Razorpay payment IDs, order IDs, and settlement statuses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 / 19, Vite, Tailwind CSS 3, Lucide React, Recharts, QRCode.react, React Hot Toast, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Razorpay SDK, Express Rate Limit, Morgan, Validator |
| **Database** | MongoDB (with automatic development fallback via `mongodb-memory-server`) |
| **Security** | Role-based authorization, Bcrypt salt hashing, JWT tokens, CORS policy, HMAC SHA256 payment verification |

---

## 📁 Project Directory Structure

```text
event-booking-system/
│
├── client/                          # React + Tailwind CSS Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # EventCard, BookingModal, TicketCard, Navbar, Footer, etc.
│   │   ├── context/                 # AuthContext (JWT, session persistence, role state)
│   │   ├── layouts/                 # MainLayout (public/user), AdminLayout (sidebar console)
│   │   ├── pages/                   # Home, Events, Details, Login, Register, Profile, etc.
│   │   │   └── admin/               # AdminDashboard, AdminEvents, AdminBookings, AdminUsers, AdminPayments
│   │   ├── services/                # Axios API instance with request & response interceptors
│   │   ├── App.jsx                  # Main router configuration & Toast container
│   │   ├── index.css                # Tailwind imports & print styling for tickets
│   │   └── main.jsx                 # Client entry point
│   ├── index.html                   # HTML template with Razorpay Checkout script
│   ├── tailwind.config.js
│   └── vite.config.js               # Dev server configuration with /api proxy
│
├── server/                          # Node.js + Express REST API Backend
│   ├── config/                      # Database configuration (db.js)
│   ├── controllers/                 # authController, eventController, bookingController, paymentController, adminController
│   ├── middleware/                  # auth.js (protect, adminOnly), errorHandler.js, rateLimiter.js
│   ├── models/                      # User.js, Event.js, Booking.js, Payment.js
│   ├── routes/                      # authRoutes, eventRoutes, bookingRoutes, paymentRoutes, adminRoutes
│   ├── scripts/                     # seed.js (sample data & admin), test-e2e.js (automated test suite)
│   ├── utils/                       # jwt.js
│   ├── server.js                    # Server entry point & auto-seed initializer
│   ├── .env.example
│   └── .env
│
├── package.json                     # Monorepo root scripts
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional) Local MongoDB daemon or MongoDB Atlas connection string. If MongoDB is not installed locally, the server automatically starts an isolated in-memory instance for development.

### 2. Clone / Open Project
```bash
cd C:\Users\singh\.gemini\antigravity\scratch\event-booking-system
```

### 3. Backend Setup
Navigate to the server directory:
```bash
cd server
npm install
```

Configure your environment variables in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/eventhub
JWT_SECRET=super_secret_eventhub_jwt_production_ready_key_2026
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_5M8o1f2G4k3L9p
RAZORPAY_KEY_SECRET=9x8y7z6w5v4u3t2s1r0q
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Frontend Setup
Navigate to the client directory:
```bash
cd ../client
npm install
```

---

## 💳 Razorpay Setup

1. Sign up for a [Razorpay Account](https://razorpay.com).
2. Go to **Settings > API Keys** in the Razorpay Dashboard.
3. Generate **Test Key ID** and **Test Key Secret**.
4. Paste them into `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourKeyId
   RAZORPAY_KEY_SECRET=YourKeySecret
   ```
5. In development mode with dummy/placeholder test keys, EventHub includes simulation fallback handling while maintaining the exact production cryptographic verification structure.

---

## 🔑 Default Accounts & Seeding

You can populate the database with 7 sample events across all categories, default customer account, and the super administrator by running:

```bash
# In server/ directory:
npm run seed
```

### Pre-configured Accounts:
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@eventhub.com` | `Admin@12345` | `/admin/dashboard` & Admin Portal |
| **User** | `john@example.com` | `User@12345` | `/dashboard` & Customer Portal |

*(Note: The server also auto-seeds default events and the admin account on initial launch if the database is empty).*

---

## 🏃 Running the Application

### Option A: Run Backend and Frontend in Separate Terminals

**Terminal 1 (Backend API Server):**
```bash
cd server
npm run dev
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

### Option B: Build Client for Production
```bash
cd client
npm run build
```

---

## 🧪 Automated End-to-End Test Suite

EventHub includes a comprehensive automated test script verifying all 18 core requirements (registration, duplicate email rejection, login, admin role protection, event CRUD, ticket booking, payment verification, seat decrements, and cancellation):

```bash
# Ensure server is running, then run:
cd server
node scripts/test-e2e.js
```

---

## 🌐 API Overview

### Authentication (`/api/auth`)
- `POST /register` – Register new user
- `POST /login` – Customer login
- `POST /admin/login` – Admin portal login
- `POST /logout` – Clear session
- `GET /me` – Retrieve authenticated user profile
- `PUT /profile` – Update name, phone, or password

### Events (`/api/events`)
- `GET /` – Search, filter by category/city/date, sort events
- `GET /:id` – Fetch event details
- `POST /` – Create event (*Admin only*)
- `PUT /:id` – Update event (*Admin only*)
- `DELETE /:id` – Cancel/Delete event (*Admin only*)

### Bookings (`/api/bookings`)
- `POST /` – Initiate booking reservation (*Private*)
- `GET /my` – Retrieve user's bookings history (*Private*)
- `GET /:id` – Retrieve specific booking details (*Private*)
- `PUT /:id/cancel` – Cancel booking and restore seats (*Private*)

### Payments (`/api/payments`)
- `POST /create-order` – Create Razorpay payment order (*Private*)
- `POST /verify` – Verify Razorpay signature & confirm booking (*Private*)

### Admin Console (`/api/admin`)
- `GET /dashboard` – Aggregated statistics & revenue trends (*Admin only*)
- `GET /users` – List all registered users (*Admin only*)
- `PUT /users/:id/status` – Activate/Deactivate user (*Admin only*)
- `GET /bookings` – Search & filter all platform bookings (*Admin only*)
- `PUT /bookings/:id/status` – Override booking status (*Admin only*)
- `GET /payments` – Audit all payment transactions (*Admin only*)

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
