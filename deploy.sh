#!/bin/bash

echo "🚀 Iniciando deploy da aplicação Geração Caldeira..."

# Verificar se docker-compose está instalado
if ! command docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down

# Construir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
docker compose up -d --build

# Verificar status
echo "📋 Status dos containers:"
docker compose ps

# Mostrar logs
echo "📜 Logs dos containers (últimas 20 linhas):"
docker compose logs --tail=20

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/health"
