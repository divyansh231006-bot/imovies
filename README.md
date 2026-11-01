# 🎬 iMovies – Online Movie Ticket Booking Platform

![iMovies Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80)

**iMovies** is a modern, full-stack cinema ticket booking platform inspired by BookMyShow, Netflix, and PVR Cinemas. It delivers an immersive cinematic experience with real-time seat availability, temporary seat locking with automatic expiration, multi-tier pricing, interactive seat maps, payment simulation with QR code ticket generation, and a protected administrative control center.

---

## 🌟 Key Features

### 🎥 User & Cinema Experience
- **Cinematic Dark Theme**: Crafted with dark navy, charcoal, and vibrant red accents (`#E50914`), custom glow effects, and smooth micro-interactions.
- **Hero Premiere Showcase**: High-impact movie backdrop banners with trailers, synopsis, IMDb ratings, and direct booking triggers.
- **Advanced Movie Discovery**: Filter by Now Showing vs. Coming Soon, genre (Sci-Fi, Action, Drama, etc.), audio language, and sort by ratings or release dates.
- **Theatres & Showtimes Browser**: Browse multiplex venues (IMAX 4K, Dolby Atmos, 4DX), inspect scheduled showtimes, and check real-time pricing across dates.
- **Visual Interactive Cinema Seat Map**:
  - Curved screen with ambient downward light reflection.
  - Multi-tier seat layout: **Silver**, **Gold**, **Platinum**, and **VIP Recliner**.
  - Color-coded seat states: **Available (Green)**, **Selected (Red)**, **Locked by Others (Amber)**, **Booked (Gray)**.
  - Maximum 8 seats per booking limit.
  - Real-time seat locking broadcasted instantaneously to other active viewers via **Socket.IO**.
  - 5-minute checkout countdown with automatic lock release upon expiration.
- **Checkout & Payment Simulation**:
  - Dynamic transparent price breakdown (subtotal, convenience fee, GST).
  - Mock payment simulation with Card, UPI, and NetBanking options.
  - Double-booking prevention with server-side validation.
- **Digital Admission Pass with QR Code**:
  - Unique booking references (`IMV-XXXXXX`).
  - Base64 QR code scannable at cinema admission.
  - One-click print/download ticket layout (`window.print()`).
- **Self-Service Booking Management**:
  - View upcoming and past reservations.
  - 1-click booking cancellation with instant seat release and automated refund status.

### 🛡️ Administrative Control Center
- **Executive Analytics Dashboard**:
  - Total users, active catalog movies, partner theatres, confirmed bookings, and cumulative box office revenue.
  - Real-time feed of recent bookings.
- **Movie Inventory Management**: Add, edit, remove movies, toggle Now Showing / Coming Soon, and set hero featured highlights.
- **Theatre & Screen Configuration**: Register theatres, addresses, amenities, and screens.
- **Showtime Scheduler**: Assign movies to screens with dates and timings, configure category seat pricing, and automatically prevent overlapping showtimes on the same screen.
- **Customer Bookings Oversight**: Search by Booking ID, customer email, or payment reference, and issue administrative cancellations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, Express Validator, Helmet, Morgan, QRCode |
| **Database** | MongoDB with Mongoose ODM (Supports local MongoDB, MongoDB Atlas, and auto-embedded MongoDB fallback) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt.js (Salt Rounds: 10), Role-based authorization |

---

## 📂 Project Structure

```
imovies/
├── client/                     # Frontend React + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation bar with responsive drawer
│   │   │   ├── Footer.jsx      # Footer with quick links & info
│   │   │   ├── MovieCard.jsx   # Cinema card with badges & actions
│   │   │   ├── SeatLayout.jsx  # Interactive SVG cinema seat layout
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Authentication state & tokens
│   │   │   └── ToastContext.jsx# Floating notification toasts
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with hero banner & sections
│   │   │   ├── Movies.jsx      # Catalog with search & multi-filter
│   │   │   ├── MovieDetails.jsx# Synopsis, cast, dates & showtime picker
│   │   │   ├── Theatres.jsx    # Multiplex venue browser
│   │   │   ├── SeatSelection.jsx # Real-time seat map with Socket.IO
│   │   │   ├── Checkout.jsx    # Order summary, timer & payment
│   │   │   ├── BookingConfirmation.jsx # QR pass & print view
│   │   │   ├── MyBookings.jsx  # User booking history & cancellation
│   │   │   ├── Login.jsx       # 1-click test credential login
│   │   │   ├── Register.jsx    # User signup
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── admin/          # Admin portal
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageMovies.jsx
│   │   │       ├── ManageTheatres.jsx
│   │   │       ├── ManageShowtimes.jsx
│   │   │       └── ManageBookings.jsx
│   │   ├── services/
│   │   │   ├── api.js          # Axios interceptors with JWT
│   │   │   └── socket.js       # Socket.IO client connection
│   │   ├── App.jsx             # React router declaration
│   │   ├── index.css           # Tailwind & cinema styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend REST API & Real-time Server
│   ├── config/
│   │   └── db.js               # MongoDB connection & embedded fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me, Password reset
│   │   ├── movieController.js  # CRUD & filters
│   │   ├── theatreController.js
│   │   ├── showtimeController.js # Scheduling & overlap check
│   │   ├── seatController.js   # Seat map status & temporary locks
│   │   ├── bookingController.js# Server pricing, booking & QR code
│   │   └── adminController.js  # Dashboard metrics & reporting
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── adminMiddleware.js  # Role check
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Screen.js
│   │   ├── Showtime.js
│   │   ├── SeatLock.js         # TTL temporary locks
│   │   └── Booking.js
│   ├── routes/                 # REST API route handlers
│   ├── sockets/
│   │   └── seatSocket.js       # Socket.IO rooms & real-time events
│   ├── services/
│   │   └── seatLockService.js  # Lock management & cleanup cron
│   ├── seed/
│   │   └── seeder.js           # Sample movies, theatres & showtimes
│   ├── test-suite.js           # 16 automated end-to-end integration tests
│   ├── app.js                  # Express middleware setup
│   ├── server.js               # Server bootstrap & Socket.IO
│   └── package.json
│
├── package.json                # Monorepo scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (v20+ recommended)
- [npm](https://www.npmjs.com/) v9+
- MongoDB (optional: an external MongoDB instance is supported via `MONGODB_URI`; if not present, the server automatically starts an embedded persistent MongoDB instance!)

---

### Installation

1. **Clone or navigate into the project directory**:
   ```bash
   cd imovies
   ```

2. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

---

### Environment Configuration

#### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_cinematic
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Database Seeding

Run the database seeder to populate **10 sample blockbuster movies**, **3 partner multiplexes**, **6 configured screens**, **48 showtimes across 4 days**, and demo accounts:

```bash
cd server
npm run seed
```

---

### Running the Application

In two separate terminal windows:

#### 1. Start the Backend API & Socket Server:
```bash
cd server
npm start
```
*Server runs on:* `http://localhost:5000`  
*API Health Endpoint:* `http://localhost:5000/api/health`

#### 2. Start the Frontend React Client:
```bash
cd client
npm run dev
```
*Client runs on:* `http://localhost:5173`

---

## 🔑 Demo Credentials

For quick evaluation, 1-click test buttons are provided directly on the Login page (`/login`):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@123` | Full admin privileges (Add movies, theatres, showtimes, manage bookings, view revenue) |
| **Standard User** | `user@imovies.com` | `User@123` | User portal (Book seats, checkout, view tickets, cancel bookings) |

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Authenticate user and receive JWT
- `GET /api/auth/me` – Current user profile (Protected)
- `POST /api/auth/forgot-password` – Generate reset token
- `POST /api/auth/reset-password` – Reset password

### Movies (`/api/movies`)
- `GET /api/movies` – List movies with filtering (`status`, `genre`, `language`, `search`, `sort`)
- `GET /api/movies/:id` – Movie details with populated upcoming showtimes
- `POST /api/movies` – Add movie (Admin)
- `PUT /api/movies/:id` – Update movie (Admin)
- `DELETE /api/movies/:id` – Remove movie (Admin)

### Theatres (`/api/theatres`)
- `GET /api/theatres` – List theatres with screens
- `GET /api/theatres/:id` – Single theatre details
- `POST /api/theatres` – Create theatre (Admin)
- `PUT /api/theatres/:id` – Update theatre (Admin)
- `DELETE /api/theatres/:id` – Remove theatre (Admin)

### Showtimes & Seats (`/api/showtimes`, `/api/seats`)
- `GET /api/showtimes` – Query showtimes by `movieId`, `theatreId`, `showDate`
- `GET /api/showtimes/:id/seats` – Visual seat layout, current booked & locked status
- `POST /api/showtimes` – Schedule new showtime with screen overlap validation (Admin)
- `POST /api/seats/lock` – Temporarily lock up to 8 seats for 5 minutes (Protected)
- `DELETE /api/seats/lock` – Release locked seats (Protected)

### Bookings (`/api/bookings`)
- `POST /api/bookings` – Server price calculation, double-lock verification, QR generation (Protected)
- `GET /api/bookings/my-bookings` – User's upcoming and past bookings (Protected)
- `GET /api/bookings/:id` – Single booking details (Protected)
- `PATCH /api/bookings/:id/cancel` – Cancel eligible booking & release seats (Protected)

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` – Overall platform statistics & recent bookings (Admin)
- `GET /api/admin/bookings` – Search and filter all customer bookings (Admin)
- `GET /api/admin/users` – List registered users (Admin)
- `GET /api/admin/revenue` – Revenue aggregation by movie (Admin)

---

## ⚡ Real-Time Socket.IO Architecture

1. **Room Assignment**: Clients join `showtime_<showtimeId>` when opening the seat selection page.
2. **Temporary Hold**: Selecting seats sends `POST /api/seats/lock`. The server verifies that no seat is booked or held by another user, applies a 5-minute lock in MongoDB, and emits `seats_locked` to the room.
3. **Lock Expiration**: An automated server background worker purges expired locks every 10 seconds and emits `seats_unlocked`.
4. **Instant Booking**: Upon payment completion, `seats_booked` is broadcasted to the room, immediately disabling those seats for all connected users.

---

## 🧪 Automated Testing

A complete end-to-end test suite is included in `server/test-suite.js` covering:
1. Database connectivity
2. Health check
3. User & Admin authentication
4. Movie listing & single movie details
5. Theatre discovery
6. Showtime querying & seat map retrieval
7. Temporary seat locking
8. Double-lock collision prevention (409 Conflict)
9. Server-side price calculation & booking creation
10. QR code verification
11. My Bookings retrieval
12. Admin dashboard revenue metrics
13. Booking cancellation & seat release

Run the tests at any time with:
```bash
cd server
npm test
```

---

## 📄 License
This project is licensed under the MIT License.
