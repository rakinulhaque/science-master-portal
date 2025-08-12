# Science Master Portal

A comprehensive web portal for science education and management.

## Project Structure

This project is organized into separate frontend and backend applications:

```
science-master-portal/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── backend/           # Node.js backend API
│   ├── src/           # Source code
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

### Backend Setup

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

The backend API will be available at `http://localhost:5000` (or the port specified in your `.env` file).

## Development

### Frontend
- Built with React + Vite
- See `frontend/README.md` for detailed frontend documentation

### Backend
- Built with Node.js + Express
- See `backend/README.md` for detailed backend documentation

## Contributing

1. Create a feature branch from `main`
2. Make your changes in the appropriate directory (frontend or backend)
3. Test your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
