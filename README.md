# GrocerNet 🛒

A full-stack quick-commerce grocery delivery platform built with **React 19, TypeScript, Node.js, Express, PostgreSQL, and Prisma**. 

Featuring three dedicated experiences: a **Customer Storefront**, a **Merchant Admin Portal**, and a **Mobile Delivery Partner App** with live map tracking and OTP-verified deliveries.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2340?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com/)

---

## 🎯 What is GrocerNet?

GrocerNet is an end-to-end grocery ordering and fulfillment system. Instead of just a simple shopping page, it includes the entire delivery chain:

1. **Customer Storefront**: Browse groceries, filter by categories/price, manage addresses with a pin-point map, pay via Razorpay or COD, and track orders live.
2. **Store Admin Dashboard**: Manage products, monitor stock levels, pack incoming orders, and oversee delivery partners.
3. **Delivery Partner Mobile Web App**: Accept packed orders, share live GPS coordinates on delivery routes, and enter the customer's 6-digit OTP to complete drop-offs.

---

## 📱 The Three Portals

### 1. 🛍️ Customer Storefront
- **Instant Search & Filter**: Real-time search with debouncing, category tabs, price filters, and sorting.
- **Smart Cart**: Persistent cart synced with `localStorage`, auto-calculating free delivery thresholds (orders over ₹499) and taxes.
- **Interactive Address Picker**: Save multiple addresses and select precise delivery coordinates using an interactive OpenStreetMap (Leaflet).
- **Smooth 3-Step Checkout**: Address selection &rarr; Payment method (Card/UPI via Razorpay or Cash on Delivery) &rarr; Instant order confirmation.
- **Live Order Tracking**: Visual progress timeline (`Placed` &rarr; `Packed` &rarr; `Out for Delivery` &rarr; `Delivered`), dynamic map showing delivery route, and a unique 6-digit delivery security OTP.

### 2. 🛡️ Store Admin Dashboard (`/admin`)
- **Business Overview**: View total orders, revenue, customer count, low-stock warnings, and active delivery partners.
- **Product Management**: Add, update, and remove products with instant image uploads (Cloudinary).
- **Order Packaging Flow**: Track placed orders and transition them to `Packed` so nearby delivery partners can claim them.
- **Fleet Management**: Onboard new delivery riders and view their active/offline shift status.

### 3. 🛵 Delivery Partner Portal (`/delivery`)
- **Mobile-First Interface**: Built specifically for delivery riders on smartphones.
- **Online/Offline Shift Switch**: Riders toggle their status to start receiving deliveries.
- **Order Queue**: View orders ready for pickup, claim assignments, and see drop-off details.
- **Live Location Sharing**: Uses browser GPS to share real-time rider coordinates with the customer's tracking map.
- **Secure OTP Verification**: The rider must enter the customer's 6-digit OTP to confirm delivery, preventing false deliveries.

---

## 🏗️ Architecture Overview

```mermaid
flowchart LR
    A["Customer Storefront"] --> D["Express 5 REST API"]
    B["Admin Dashboard"] --> D
    C["Delivery Partner App"] --> D

    D --> E[("PostgreSQL\n(Prisma ORM)")]
    D --> F["Razorpay Payments"]
    D --> G["Cloudinary Media"]
    D --> H["Nodemailer Notifications"]
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Hot Toast |
| **Mapping** | Leaflet & React-Leaflet (OpenStreetMap) |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database & ORM** | PostgreSQL (Neon serverless), Prisma 7 |
| **Authentication** | JWT (JSON Web Tokens), bcrypt password hashing |
| **Payments** | Razorpay SDK (with server-side HMAC-SHA256 signature verification) |
| **Media & Storage** | Cloudinary & Multer |
| **Email & Notifications** | Nodemailer (SMTP notifications & automated low-stock alerts) |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database (e.g. free tier on [Neon.tech](https://neon.tech))

### 1. Clone the repository
```bash
git clone https://github.com/GauravSharma82715/grocerNet.git
cd grocerNet
```

### 2. Setup Server
```bash
cd server
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your database URL and secrets in `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@your-neon-db.tech/neondb?sslmode=require"
JWT_SECRET="your_jwt_secret"
ADMIN_EMAILS="admin@example.com"
CLIENT_URL="http://localhost:5173"

# Optional integrations
RAZORPAY_KEY_ID="rzp_test_your_key"
RAZORPAY_KEY_SECRET="your_secret"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Initialize the database and seed demo products:
```bash
npx prisma generate
npm run seed
```

Start the backend:
```bash
npm run server
```
*API will run at `http://localhost:5000`*

### 3. Setup Client
In a new terminal window:
```bash
cd client
npm install
```

Copy the client environment file:
```bash
cp .env.example .env
```

Start the frontend:
```bash
npm run dev
```
*App will run at `http://localhost:5173`*

---

## 🔒 Key Engineering Details

- **Cryptographic Payment Security**: Server recalculates HMAC-SHA256 signatures before marking Razorpay orders as `Paid`, preventing frontend tampering.
- **Smart Session Handling**: Axios interceptor automatically detects route scope to send customer tokens for store routes and delivery partner tokens for rider routes.
- **Optimized Cart Calculations**: Delivery fees, taxes, and discounts are computed on-the-fly from the source items to prevent out-of-sync state bugs.
- **OTP Verification Safeguard**: Orders cannot be marked completed without the rider submitting the customer's matching 6-digit code.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
