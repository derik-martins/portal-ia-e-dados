#!/bin/bash

echo "🚀 Deploy em produção - Geração Caldeira"

# Verificar se arquivo .env.prod existe
if [ ! -f .env.prod ]; then
    echo "❌ Arquivo .env.prod não encontrado!"
    echo "📋 Copie .env.example para .env.prod e ajuste as configurações"
    exit 1
fi

# Carregar variáveis de ambiente
export $(cat .env.prod | xargs)

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Construir e iniciar containers
echo "🏗️  Construindo e iniciando containers em produção..."
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "📋 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

# Mostrar logs
echo "📜 Logs dos containers (últimas 20 linhas):"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Deploy em produção concluído!"
echo "🌐 Frontend: http://${DOMAIN}:3000"
echo "🔧 Backend: http://${DOMAIN}:3001"
echo "📊 Health Check: http://${DOMAIN}:3001/health"
