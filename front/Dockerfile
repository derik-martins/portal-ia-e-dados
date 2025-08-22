FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

# Instalar openssl para certificados e curl para healthcheck
RUN apk add --no-cache openssl curl

COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configurações do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.secure /etc/nginx/conf.d/secure.conf.template
COPY proxy_params /etc/nginx/proxy_params

# Criar diretório para certificados auto-assinados (desenvolvimento)
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Gerar certificado auto-assinado para desenvolvimento
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/localhost.key \
    -out /etc/ssl/certs/localhost.crt \
    -subj "/C=BR/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"

# Script de inicialização
COPY <<EOF /docker-entrypoint.d/30-setup-ssl.sh
#!/bin/sh

# Se estiver em produção e tiver certificados SSL, usar configuração segura
if [ "\$NODE_ENV" = "production" ] && [ -f "\$SSL_CERT_PATH" ] && [ -f "\$SSL_KEY_PATH" ]; then
    echo "Configurando SSL para produção..."
    envsubst '\$DOMAIN,\$SSL_CERT_PATH,\$SSL_KEY_PATH,\$NGINX_CLIENT_MAX_BODY_SIZE,\$NGINX_PROXY_TIMEOUT' < /etc/nginx/conf.d/secure.conf.template > /etc/nginx/conf.d/default.conf
else
    echo "Usando configuração de desenvolvimento (HTTP)"
fi

# Criar diretórios de logs
mkdir -p /var/log/nginx
touch /var/log/nginx/suspicious.log

EOF

RUN chmod +x /docker-entrypoint.d/30-setup-ssl.sh

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]