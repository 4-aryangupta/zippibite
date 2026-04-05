# ZippBite — Full-Stack Food Delivery App

A production-grade, cinematic dark-themed food delivery application. Built with React (Vite) + Node/Express + MongoDB.

## Prerequisites

- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas URI

## Quick Start

### 1. Start MongoDB
```bash
# If running locally
mongod
```
Or update `server/.env` with your Atlas URI.

### 2. Install & Seed Backend
```bash
cd server
npm install
npm run seed    # Seeds 12 restaurants + 80+ menu items + admin user
npm run dev     # Starts on port 5000
```

### 3. Install & Start Frontend
```bash
cd client
npm install
npm run dev     # Opens http://localhost:5173
```

## Admin Credentials
```
Email:    admin@zippbite.com
Password: Admin@123
```

## Project Structure
```
/server
  /models         → User, Restaurant, MenuItem, Order, Cart
  /controllers    → Auth, Restaurant, Cart, Order, User, Admin
  /routes         → All API routes
  /middleware     → JWT auth, adminOnly, errorHandler
  server.js       → Entry point (Express + Socket.io)
  seed.js         → Database seeder
  .env            → Environment variables

/client
  /src
    /api          → api.js (Axios, all endpoints)
    /context      → AppContext (Auth + Cart + Toast)
    /components   → Navbar, AuthModal, ReelSection
    /pages        → Dashboard, RestaurantPage, Cart, Checkout, etc.
    /pages/admin  → AdminLayout, OrderTickets, Managers
  vite.config.js  → Vite + Tailwind CSS v4 + API proxy
  src/index.css   → ZippBite design tokens
```

## API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| POST | /api/auth/logout | — |
| GET | /api/auth/me | JWT |
| GET | /api/restaurants | — |
| GET | /api/restaurants/:id | — |
| GET | /api/restaurants/:id/menu | — |
| GET/POST/PUT/DELETE | /api/cart/... | JWT |
| POST | /api/orders | JWT |
| GET | /api/orders/my | JWT |
| GET | /api/orders/:id | JWT |
| PUT | /api/user/address | JWT |
| ALL | /api/admin/... | JWT + Admin |

## Environment Variables

`server/.env`
```
MONGO_URI=mongodb://localhost:27017/zippbite
JWT_SECRET=your-secret-here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Features
- ✅ JWT auth (httpOnly cookies) + bcrypt passwords
- ✅ 12 seeded restaurants with 80+ menu items
- ✅ Horizontal reel section (video / CSS fallback)
- ✅ Multi-restaurant cart conflict resolution
- ✅ Bill breakdown: subtotal + GST 5% + delivery + packaging
- ✅ Saved addresses per user (persists across sessions)
- ✅ Admin order ticket window with countdown timer
- ✅ Admin can update reel URL without code deploy
- ✅ Real-time order polling (Socket.io ready)
- ✅ Framer Motion throughout (modal, success page, etc.)
- ✅ Fully responsive (mobile + desktop)
