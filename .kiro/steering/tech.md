# Technology Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Custom API service with fetch

## Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: cors middleware

## Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 Alpine
- **Reverse Proxy**: Nginx (frontend)
- **Environment**: Multi-stage builds for production

## Development Tools
- **Backend Dev Server**: nodemon
- **Frontend Dev Server**: Vite dev server
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript 5.5+

## Common Commands

### Development
```bash
# Start development environment
./deploy.sh

# Frontend only
cd front && npm run dev

# Backend only  
cd back && npm run dev
```

### Production
```bash
# Production deployment
./deploy-prod.sh

# Build frontend
cd front && npm run build

# Start backend production
cd back && npm start
```

### Docker Operations
```bash
# View container status
docker compose ps

# View logs
docker compose logs --tail=20

# Stop all containers
docker compose down
```

### Health Checks
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health endpoint: http://localhost:3001/health