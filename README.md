# RO Water Supply App — Full-Stack MERN

A complete MERN (MongoDB, Express, React, Node.js) application for an RO Water Supply delivery business.

---

## Default Credentials

| Role     | Email             | Password     |
| -------- | ----------------- | ------------ |
| Admin    | admin@roapp.com   | Admin@12345  |
| Customer | customer@test.com | Customer@123 |

---

## Quick Start

### 1. Clone / Extract the project

```bash
cd ro-water-supply-app
```

### 2. Setup Backend

```bash
cd server
npm install
```

Edit `server/.env` and replace `MONGO_URI` with your real MongoDB Atlas URI:

```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxx.mongodb.net/ro-water-supply?retryWrites=true&w=majority
```

### 3. Seed the Database

```bash
npm run seed
```

This creates admin, customer, products, pricing, time slots, settings, and coupons.

### 4. Start Backend

```bash
npm run dev
```

Server runs on https://roapp.onrender.com

### 5. Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Add your IP to the allowlist (or 0.0.0.0/0 for dev)
5. Copy the connection string and paste it into `server/.env` as `MONGO_URI`

---

## Testing the Full Order Flow

1. **Admin** → Login at `/login` → redirected to `/admin`
2. **Admin** → Go to `/admin/settings` → verify shop coordinates are set
3. **Admin** → Go to `/admin/pricing` → verify pricing slabs exist
4. **Customer** → Register or login → browse `/products`
5. **Customer** → Add a 20L Jar to cart → go to `/cart`
6. **Customer** → Uncheck "I have empty jar" → see deposit added
7. **Customer** → Go to `/checkout` → enter delivery address
8. **Customer** → Enter coordinates (e.g. lat: 28.63, lng: 77.22) → click "Check Delivery"
9. **Customer** → System calculates distance, fee, ETA using Haversine formula
10. **Customer** → Select time slot, payment method → "Place Order"
11. **Admin** → `/admin/orders` → see the new order → change status to "confirmed"
12. **Customer** → Gets notification → check `/notifications`
13. **Customer** → `/payments/submit` → upload payment screenshot + UTR
14. **Admin** → `/admin/payments` → approve payment
15. **Customer** → Payment status becomes "approved"
16. **Admin** → `/admin/jars` → jar ledger auto-created with the order
17. **Admin** → `/admin/reports` → see updated revenue

---

## Testing Payment Verification

1. Customer submits payment via `/payments/submit`
2. Admin goes to `/admin/payments` (filter: pending)
3. Admin clicks "Approve" → order marked paid, customer notified
4. Admin can also "Reject" (customer must resubmit)

---

## Testing Jar Deposit

- 20L Jar has `isJarProduct: true` and `depositAmount: 150`
- In cart: uncheck "I have empty jar" → ₹150 deposit added
- After order placed → JarLedger entry created automatically
- Admin can add manual entries (returned, lost, damaged) at `/admin/jars`
- Customer views jar balance at `/jars`

---

## Subscription Testing

1. Customer → `/subscriptions` → "+ New" → select product, frequency
2. Admin → `/admin/subscriptions` → see all subscriptions
3. Admin → Click "Process Due Orders" → auto-creates orders for due subscriptions

---

## Event Booking Testing

1. Public → `/event-booking` → submit form (no login needed)
2. Admin → `/admin/events` → see booking → click "Send Quote" → enter amount
3. Admin can confirm/complete/cancel events

---

## Coupon Testing

1. Admin → `/admin/coupons` → create coupon (e.g. `WELCOME10`, flat ₹10)
2. Customer → checkout → enter coupon code → discount applied

---

## Environment Variables

### server/.env

| Variable       | Description                     |
| -------------- | ------------------------------- |
| PORT           | Backend port (default: 5000)    |
| MONGO_URI      | MongoDB Atlas connection string |
| JWT_SECRET     | Secret key for JWT tokens       |
| JWT_EXPIRES_IN | Token expiry (default: 7d)      |
| CLIENT_URL     | Frontend URL for CORS           |
| ADMIN_EMAIL    | Default admin email             |
| ADMIN_PASSWORD | Default admin password          |
| UPLOAD_DIR     | Path for file uploads           |
| MAX_FILE_SIZE  | Max upload size in bytes        |

### client/.env

| Variable          | Description          |
| ----------------- | -------------------- |
| VITE_API_BASE_URL | Backend API URL      |
| VITE_APP_NAME     | App name shown in UI |
| VITE_ENABLE_PWA   | Enable PWA features  |

---

## Deploying to Render (Backend)

1. Push to GitHub
2. New Web Service on Render → select your repo
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`
5. Add all env vars from `server/.env` in Render dashboard
6. Update `CLIENT_URL` to your Vercel frontend URL

---

## Deploying to Vercel (Frontend)

1. Push to GitHub
2. Import project on Vercel
3. Root directory: `client`
4. Build command: `npm run build`
5. Output dir: `dist`
6. Add env var: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`

---

## Troubleshooting MongoDB Connection

**Error: `MongoServerSelectionError`**

- Check that `MONGO_URI` is correct in `server/.env`
- Add `0.0.0.0/0` to MongoDB Atlas IP Allowlist
- Ensure username/password in the URI has no special chars (URL-encode them if needed)

**Error: `Authentication failed`**

- Re-check database user credentials in Atlas → Database Access

**Error: `ECONNREFUSED`**

- You might be using a local MongoDB URI. Use Atlas URI instead.

---

## Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Frontend    | React 18, Vite, Tailwind CSS     |
| State       | Redux Toolkit + RTK Query        |
| Routing     | React Router v6                  |
| Backend     | Node.js, Express.js              |
| Database    | MongoDB (Mongoose)               |
| Auth        | JWT + bcrypt                     |
| File Upload | Multer                           |
| Security    | Helmet, CORS, Rate Limiting      |
| Distance    | Haversine formula (no paid APIs) |
| Payment     | Manual UPI proof system          |

---

## API Endpoints Summary

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/products
POST   /api/products (admin)
PUT    /api/products/:id (admin)
DELETE /api/products/:id (admin)

GET    /api/pricing/rules
POST   /api/pricing/calculate

POST   /api/orders
GET    /api/orders/my
GET    /api/orders (admin)
PATCH  /api/orders/:id/status (admin)

POST   /api/payments/proof
GET    /api/payments (admin)
PATCH  /api/payments/:id/approve (admin)

GET    /api/reports/dashboard (admin)
GET    /api/export/orders (admin)

... and many more
```

Full API list: see `server/src/routes/index.js`
