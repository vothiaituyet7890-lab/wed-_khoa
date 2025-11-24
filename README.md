# SaaS Platform for Educational Institutions

A multi-tenant SaaS platform built with Node.js, Express, React, and PostgreSQL, designed for educational institutions to manage their online presence.

## Features

- Multi-tenant architecture
- Role-based access control (Super Admin, Tenant Admin)
- Department and faculty management
- Course and program management
- News and events management
- Research project tracking
- Subscription and plan management

## Tech Stack

- Backend:

  - Node.js + Express
  - PostgreSQL with Prisma ORM
  - JWT Authentication
  - Express Validator

- Frontend:
  - React with Vite
  - React Router
  - Axios for API calls
  - Modern responsive UI

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Quanmingcao/SaaS.git
   cd SaaS
   ```

2. Install dependencies:

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Create a .env file in the root directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
   JWT_SECRET="your-secret-key"
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

5. Start the development servers:

   ```bash
   # Start backend (from root directory)
   npm run dev

   # Start frontend (from frontend directory)
   cd frontend
   npm run dev
   ```

### Initial Login Credentials

After running the seed script, you can log in with:

- Super Admin:

  - Email: admin@system.com
  - Password: admin123

- Demo Tenant Admin:
  - Email: admin@demo.edu
  - Password: tenant123

## Database Setup

### Local Development

1. Install PostgreSQL locally
2. Create a new database
3. Update .env with your database credentials
4. Run migrations: `npx prisma migrate dev`

### Production Deployment

1. Set up a PostgreSQL database (recommended: Railway.app or Supabase)
2. Update the production environment variables
3. Run migrations: `npx prisma migrate deploy`

## Deployment

### Backend

1. Set up environment variables
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the server: `npm start`

### Frontend

1. Install dependencies: `cd frontend && npm install`
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting service

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Support

For support, email contact@example.com or create an issue in the repository.
