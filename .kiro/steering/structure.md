# Project Structure

## Root Level
```
/
├── front/          # React TypeScript frontend
├── back/           # Node.js Express backend
├── .env.example    # Environment template
├── docker-compose.yml      # Development containers
├── docker-compose.prod.yml # Production containers
├── deploy.sh       # Development deployment script
└── deploy-prod.sh  # Production deployment script
```

## Frontend Structure (`front/`)
```
front/
├── src/
│   ├── components/
│   │   ├── features/       # Feature-specific components
│   │   │   ├── autenticacao/   # Authentication components
│   │   │   ├── calendario/     # Calendar components
│   │   │   ├── dicas/          # Tips components
│   │   │   ├── discord/        # Discord integration
│   │   │   ├── feed/           # News feed components
│   │   │   └── forum/          # Forum components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (AuthContext)
│   ├── pages/              # Page components (Login, Dashboard)
│   ├── services/           # API services
│   └── main.tsx            # App entry point
├── Dockerfile              # Frontend container
└── nginx.conf              # Nginx configuration
```

## Backend Structure (`back/`)
```
back/
├── src/
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── server.js           # Server entry point
├── Dockerfile              # Backend container
└── create-test-user.js     # Database seeding script
```

## Naming Conventions

### Frontend
- **Components**: PascalCase (e.g., `FormularioLogin.tsx`, `CardDica.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Folders**: lowercase with descriptive names in Portuguese
- **Props/Variables**: camelCase

### Backend
- **Controllers**: PascalCase with "Controller" suffix (e.g., `AuthController.js`)
- **Models**: PascalCase with "Model" suffix (e.g., `UserModel.js`)
- **Routes**: camelCase with "Routes" suffix (e.g., `authRoutes.js`)
- **Middleware**: camelCase (e.g., `authMiddleware.js`)

## Architecture Patterns

### Frontend
- **Feature-based organization**: Components grouped by functionality
- **Context API**: Global state management for authentication
- **Custom hooks**: Reusable logic extraction
- **Component composition**: UI components in separate `ui/` folder

### Backend
- **MVC Pattern**: Controllers handle routes, Models handle data
- **Middleware chain**: Authentication, validation, CORS
- **Environment-based configuration**: Different configs for dev/prod
- **Database abstraction**: Centralized database connection

## File Organization Rules
- Portuguese naming for user-facing features and components
- English naming for technical/infrastructure code
- Separate concerns: UI components, business logic, API calls
- Co-locate related files within feature folders