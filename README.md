# Science Master Portal

A comprehensive web portal for science education and management with student information system, user authentication, and batch management.

## Project Structure

This project is organized into separate frontend and backend applications:

```
science-master-portal/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── backend/           # Node.js backend API (created from restructuring)
│   ├── src/           # Source code
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── src/               # Main backend implementation (from feature branches)
│   ├── controllers/   # Route logic
│   │   ├── userController.js
│   │   ├── studentController.js
│   │   ├── batchController.js
│   │   ├── branchController.js
│   │   └── studentInfoController.js
│   ├── models/        # Sequelize models
│   │   ├── user.js
│   │   ├── student.js
│   │   ├── batch.js
│   │   ├── branch.js
│   │   ├── studentPayment.js
│   │   ├── associations.js
│   │   └── db.js
│   ├── routes/        # Express routes
│   │   ├── userRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── batchRoutes.js
│   │   └── branchRoutes.js
│   ├── middleware/    # Authentication & validation
│   │   └── auth.js
│   ├── utils/         # Utility functions
│   │   ├── jwt.js
│   │   └── password.js
│   └── server.js      # App entry point
└── README.md          # This file
```

## Features

### User Management
- Super admin creation (only one allowed)
- Admin user creation by super admin
- JWT-based authentication
- Role-based access control

### Student Information System
- Student registration and management
- Student payment tracking
- Student due amount calculation
- Comprehensive student information storage

### Branch & Batch Management
- Branch creation and management
- Batch creation with branch association
- Student-batch assignment
- Batch capacity management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).

### Backend Setup (Main Implementation)

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```

2. Set up your PostgreSQL database and update connection details in `src/models/db.js`

3. Start the server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3000` (or the port specified in the server configuration).

### Alternative Backend Setup (Restructured)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Management
- `GET /users` — List all users
- `POST /users` — Create admin user (super admin only)
- `POST /users/super-admin` — Create super admin (one-time only)
- `POST /users/login` — User authentication

### Student Management
- `GET /students` — List all students
- `POST /students` — Create new student
- `GET /students/:id` — Get student details
- `PUT /students/:id` — Update student information
- `DELETE /students/:id` — Delete student

### Branch Management
- `GET /branches` — List all branches
- `POST /branches` — Create new branch
- `GET /branches/:id` — Get branch details
- `PUT /branches/:id` — Update branch
- `DELETE /branches/:id` — Delete branch

### Batch Management
- `GET /batches` — List all batches
- `POST /batches` — Create new batch
- `GET /batches/:id` — Get batch details
- `PUT /batches/:id` — Update batch
- `DELETE /batches/:id` — Delete batch

## Database Schema

### Models
- **User**: Authentication and role management
- **Student**: Student information and contact details
- **Branch**: Academic branches/departments
- **Batch**: Student groups with branch association
- **StudentPayment**: Payment tracking and due amounts

### Associations
- Branch has many Batches
- Batch belongs to Branch
- Student belongs to Batch
- Student has many StudentPayments

## Development Notes

- Database tables are auto-created on server start using Sequelize sync
- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured for cross-origin requests
- Role-based middleware protects admin routes

## Development

### Frontend
- Built with React + Vite
- Hot Module Replacement (HMR) enabled
- See `frontend/README.md` for detailed frontend documentation

### Backend
- Built with Node.js + Express + Sequelize
- PostgreSQL database integration
- MVC architecture pattern
- See `backend/README.md` for detailed backend documentation

## Contributing

1. Create a feature branch from `main`
2. Make your changes in the appropriate directory (frontend or backend)
3. Test your changes thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.
