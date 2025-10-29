# BookShare API Documentation

## Overview
This document describes the authentication APIs implemented for the BookShare application using Next.js API routes with MongoDB database storage.

## Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update the environment variables:
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
ADMIN_CODE=ADMIN123
```

## Database Initialization

**Endpoint:** `POST /api/auth/init`

This endpoint initializes the database and creates the default admin user. Run this once after setting up your MongoDB connection.

**Response:**
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

## Authentication APIs

### 1. User Signup
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "agreeToTerms": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false,
    "createdAt": "2024-10-28T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false,
    "createdAt": "2024-10-28T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Admin Login
**Endpoint:** `POST /api/auth/admin`

**Request Body:**
```json
{
  "email": "admin@bookshare.com",
  "password": "Admin123!",
  "adminCode": "ADMIN123",
  "rememberMe": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin authentication successful",
  "user": {
    "email": "admin@bookshare.com",
    "firstName": "Admin",
    "lastName": "User",
    "isAdmin": true,
    "createdAt": "2024-10-28T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Protected Routes

### User Profile (Protected)
**Endpoint:** `GET /api/user/profile`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "id": "user_123...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false,
    "createdAt": "2024-10-28T..."
  }
}
```

### Admin - Get All Users (Admin Only)
**Endpoint:** `GET /api/admin/users`
**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [...],
  "totalUsers": 10
}
```

## Authentication Middleware

### `authenticateToken`
Verifies JWT token and adds user info to request.

### `requireAdmin`
Extends `authenticateToken` to ensure user has admin privileges.

## Usage Examples

### Frontend Authentication
```javascript
// Store token after login
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Make authenticated requests
const token = localStorage.getItem('token');
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Default Admin Account

A default admin account is automatically created:
- **Email:** admin@bookshare.com
- **Password:** Admin123!
- **Admin Code:** ADMIN123

## Creating Additional Admin Users

Run the admin creation script:
```bash
npm run create-admin
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

1. **Password Hashing:** Uses bcrypt with 12 salt rounds
2. **JWT Tokens:** 7-day expiration
3. **Admin Protection:** Separate admin code verification
4. **Input Validation:** Comprehensive validation on all endpoints
5. **Error Handling:** Secure error messages (no sensitive info leakage)

## Error Codes

- **400:** Bad Request (validation errors)
- **401:** Unauthorized (invalid credentials)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found (user/resource not found)
- **409:** Conflict (email already exists)
- **500:** Internal Server Error

## Data Storage

**MongoDB Integration:**
- **Database:** MongoDB Atlas (cloud-hosted)
- **ODM:** Mongoose for schema validation and queries
- **Models:** User model with proper indexing
- **Connection:** Cached connection with hot reload support

**Database Schema:**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  firstName: String,
  lastName: String,
  password: String (bcrypt hashed),
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Setup Instructions:**
1. Create MongoDB Atlas account
2. Set up database cluster
3. Get connection string
4. Add to `.env.local` as `MONGODB_URI`
5. Run initialization endpoint: `POST /api/auth/init`