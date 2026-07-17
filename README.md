# Latitude Express Line - Shipment Tracking System

A full-stack application for admin shipment management and customer tracking.

## Features
- **Admin Panel**: Secure login with email/password, create shipments, generate tracking codes
- **Tracking Page**: Public customer interface to track shipments with tracking code
- **JWT Authentication**: Secure token-based admin authentication
- **RESTful API**: Express backend with role-based access control

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React + Axios
- **Database**: SQLite (development) / PostgreSQL (production)
- **Auth**: JWT + bcryptjs

## Project Structure
```
├── backend/          # Express API server
├── frontend/         # React admin dashboard & tracking page
├── docs/            # Documentation
└── package.json     # Root package file
```

## Quick Start

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Setup Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create admin account (protected)

### Admin Routes (Protected)
- `POST /api/shipments` - Create shipment
- `GET /api/shipments` - List all shipments
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment

### Public Routes
- `GET /api/track/:code` - Track shipment by code

## Database Schema

### admins
- id (Primary Key)
- email (Unique)
- password (hashed)
- created_at

### shipments
- id (Primary Key)
- tracking_code (Unique)
- customer_name
- customer_email
- origin
- destination
- status (pending, in-transit, delivered)
- created_at
- updated_at
