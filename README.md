# Hirenova

A full-stack job portal application built with Node.js, Express, MongoDB, and Redis.

## Overview

Hirenova is a job portal platform that connects job seekers with employers. It provides authentication, job listing management, and user role-based access control.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Role-Based Access Control**: Three user roles - jobseeker, employer, and admin
- **Job Management**: Create, read, update, and delete job listings
- **Pagination & Search**: HATEOAS-compliant pagination with search functionality
- **Password Management**: Forgot password and reset password flows
- **Security**: Rate limiting, Helmet.js, CORS, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Email**: Nodemailer
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

- Node.js (v18+)
- MongoDB
- Redis

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your .env file with:
# - DATABASE_CONNECTION_URL
# - DB_NAME
# - REDIS_HOST
# - REDIS_PORT
# - REDIS_USERNAME
# - REDIS_PASSWORD
# - ACCESS_TOKEN_SECRET
# - EMAIL_SECRET
# - EMAIL_USER
# - EMAIL_PASS
# - CLIENT_URL
# - PORT
```

## Running the Application

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint                            | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| POST   | `/api/v1/auth/signup`               | Register a new user             |
| POST   | `/api/v1/auth/login`                | User login                      |
| POST   | `/api/v1/auth/logout`               | User logout                     |
| PATCH  | `/api/v1/auth/confirm-email/:token` | Confirm email address           |
| PATCH  | `/api/v1/auth/forgot-password`      | Request password reset          |
| PATCH  | `/api/v1/auth/reset-password`       | Reset password                  |
| PATCH  | `/api/v1/auth/change-password`      | Change password (authenticated) |

### Jobs

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | `/api/v1/jobs`     | Get all jobs (public)            |
| GET    | `/api/v1/jobs/:id` | Get single job (authenticated)   |
| POST   | `/api/v1/jobs`     | Create job (employer/admin)      |
| PUT    | `/api/v1/jobs/:id` | Update job (owner/admin)         |
| PATCH  | `/api/v1/jobs/:id` | Partial update job (owner/admin) |
| DELETE | `/api/v1/jobs/:id` | Delete job (owner/admin)         |

### Admin

| Method | Endpoint                             | Description             |
| ------ | ------------------------------------ | ----------------------- |
| POST   | `/api/v1/admin/users`                | Add new user (admin)    |
| GET    | `/api/v1/admin/users`                | Get all users (admin)   |
| GET    | `/api/v1/admin/users/:id`            | Get single user (admin) |
| PATCH  | `/api/v1/admin/users/make-admin/:id` | Upgrade user to admin   |
| DELETE | `/api/v1/admin/users/:id`            | Delete user (admin)     |

## User Roles

- **Jobseeker**: Can view jobs
- **Employer**: Can create, update, and delete their own jobs
- **Admin**: Full access to all resources and user management

## Project Structure

```
src/
├── api/
│   └── v1/
│       ├── admin/         # Admin controllers
│       ├── auth/          # Auth controllers
│       └── job/           # Job controllers
├── config/                # Configuration files
├── db/                    # Database connection
├── lib/
│   ├── auth/             # Auth service
│   ├── job/              # Job service
│   ├── mailer/           # Email service
│   ├── token/            # JWT token service
│   ├── user/             # User service
│   └── validators/       # Joi validation schemas
├── middleware/           # Express middleware
├── model/                # Mongoose models
├── routes/              # Express routes
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── app.ts               # Express app setup
└── index.ts             # Entry point
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "code": 200,
  "message": "Success message",
  "data": { ... },
  "links": {
    "self": "/api/v1/resource"
  }
}
```

## Error Handling

Errors return appropriate HTTP status codes:

- 400: Bad Request (validation errors)
- 401: Authentication Failed
- 403: Authorization Failed
- 404: Not Found
- 500: Internal Server Error

## Security Features

- JWT token authentication with blacklist
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for HTTP header security
- CORS configuration
- Input validation with Joi
- MongoDB query injection prevention

## License

MIT
