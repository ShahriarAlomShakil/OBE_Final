# OBE (Outcome-Based Education) Desktop System

A comprehensive desktop application for managing Outcome-Based Education processes, including Program Outcomes (POs), Course Outcomes (COs), CO-PO mapping, assessment management, and attainment calculation.

## 📋 Project Overview

This system is designed to help educational institutions implement and manage Outcome-Based Education effectively. It provides tools for faculty, coordinators, and administrators to track student learning outcomes, assess course effectiveness, and generate comprehensive reports.

### Key Features

- **User Management**: Role-based access control (Admin, Faculty, Coordinator)
- **Academic Structure**: Department, Program, Batch, and Course management
- **Outcome Management**: Define and manage Program Outcomes (POs) and Course Outcomes (COs)
- **CO-PO Mapping**: Map Course Outcomes to Program Outcomes with correlation levels
- **Assessment Management**: Create and manage various assessment types (quizzes, assignments, exams)
- **Attainment Calculation**: Automatic calculation of CO and PO attainment levels
- **Comprehensive Reporting**: Generate detailed reports with visualizations

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js (MVC + Service Layer Architecture)
- **Database**: MySQL 8.0+ with mysql2 driver
- **Caching**: Redis 7+
- **Queue**: Bull (Redis-based job queue)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, Rate Limiting, Input Validation

### Frontend
- **Desktop Framework**: Electron.js 28+
- **UI Library**: React.js 18+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand
- **Charts**: Recharts / Chart.js

### Testing & Quality
- **Testing**: Jest, Supertest (API), Playwright (E2E)
- **Documentation**: Swagger/OpenAPI 3.0
- **Code Quality**: ESLint, Prettier

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **File Storage**: AWS S3 / MinIO (S3-compatible)

## 📁 Project Structure

```
obe-system/
├── backend/                    # Node.js Express API
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── models/               # Database models
│   ├── services/             # Business logic layer
│   ├── repositories/         # Data access layer
│   ├── routes/               # API routes
│   ├── middlewares/          # Express middlewares
│   ├── utils/                # Utility functions
│   ├── validators/           # Input validation
│   ├── jobs/                 # Background jobs
│   ├── __tests__/            # Test files
│   └── docs/                 # API documentation
├── frontend/                  # Electron + React
│   ├── public/               # Public assets
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── store/            # State management
│   └── electron/             # Electron main process
├── database/
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Seed data
│   └── schema.sql            # Complete schema
├── docker/                    # Docker configurations
└── docs/                      # Project documentation
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **MySQL**: Version 8.0 or higher ([Download](https://www.mysql.com/downloads/))
- **Redis**: Version 7 or higher ([Download](https://redis.io/download))
- **Git**: For version control ([Download](https://git-scm.com/downloads))

### Optional (for production deployment)
- **Docker & Docker Compose**: For containerization ([Download](https://www.docker.com/))
- **AWS Account**: For S3 file storage (or use MinIO for local S3-compatible storage)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd obe-system
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your database and configuration settings
```

### 3. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE obe_system;

# Import schema
mysql -u root -p obe_system < database/schema.sql

# (Optional) Import seed data
mysql -u root -p obe_system < database/seeds/seed.sql
```

### 4. Start Redis

```bash
# Linux/Mac
redis-server

# Windows (using WSL or Windows Redis port)
redis-server.exe
```

### 5. Frontend Setup

```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The backend API will run on `http://localhost:3000`
The Electron app will launch automatically

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build and package frontend
cd frontend
npm run build
npm run package
```

## 🔐 Default Credentials

After running seed data, you can login with:

- **Admin**: 
  - Email: `admin@obe.edu`
  - Password: `Admin@123`

- **Faculty**: 
  - Email: `faculty@obe.edu`
  - Password: `Faculty@123`

⚠️ **Important**: Change these credentials after first login!

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm test

# Backend integration tests
npm run test:integration

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📚 API Documentation

After starting the backend server, access the API documentation at:
- **Swagger UI**: http://localhost:3000/api-docs

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 Documentation

- [Development Plan](../development_plan_revised.md)
- [Database Schema](../database_revised.md)
- [API Documentation](backend/docs/api-documentation.md)
- [Architecture Guide](docs/architecture.md)
- [User Manual](docs/user-manual.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Developer**: [Developer Name]
- **Frontend Developer**: [Developer Name]
- **Database Administrator**: [DBA Name]

## 📞 Support

For support, email support@obesystem.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Phase 1: Core Setup (Weeks 1-2)
- [ ] Phase 2: Backend Development (Weeks 3-6)
- [ ] Phase 3: Frontend Development (Weeks 7-10)
- [ ] Phase 4: Integration & Testing (Weeks 11-12)
- [ ] Phase 5: Deployment & Documentation (Weeks 13-14)

---

**Built with ❤️ for Educational Excellence**
