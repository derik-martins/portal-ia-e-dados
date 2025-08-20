# Geração Caldeira - Backend API

Backend da aplicação Geração Caldeira desenvolvido em Node.js com Express e PostgreSQL.

## 🚀 Tecnologias

- Node.js
- Express.js
- PostgreSQL
- JWT para autenticação
- Docker & Docker Compose
- bcryptjs para hash de senhas

## 📁 Estrutura do Projeto

```
back/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── AuthController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validation.js
│   ├── models/
│   │   └── UserModel.js
│   ├── routes/
│   │   └── authRoutes.js
│   └── server.js
├── .env
├── Dockerfile
└── package.json
```

## 🔧 Instalação e Execução

### Desenvolvimento Local

```bash
cd back
npm install
npm run dev
```

### Com Docker Compose (Recomendado)

```bash
# Na raiz do projeto
./deploy.sh
```

### Produção

```bash
# Configurar arquivo .env.prod
cp .env.example .env.prod
# Editar .env.prod com suas configurações

# Deploy em produção
./deploy-prod.sh
```

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil (requer token)

### Health Check

- `GET /health` - Status da API
- `GET /` - Informações da API

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <seu-token-jwt>
```

## 🌐 Variáveis de Ambiente

```env
PORT=3001
HOST=0.0.0.0
DB_HOST=db
DB_PORT=5432
DB_NAME=geracao_caldeira
DB_USER=postgres
DB_PASS=postgres123
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=7d
DOMAIN=localhost
CORS_ORIGIN=http://localhost:3000
```

## 🐳 Docker

A aplicação roda em 3 containers:
- PostgreSQL (porta 5432)
- Backend API (porta 3001)
- Frontend (porta 3000)

## 📊 Monitoramento

- Health Check: `GET /health`
- Logs: `docker-compose logs backend`
- Status: `docker-compose ps`
