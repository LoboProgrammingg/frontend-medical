# ==============================================
# FRONTEND DOCKERFILE - PRODUÇÃO
# ==============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Declarar ARG para variáveis de ambiente do build
# Railway passa variáveis de ambiente, mas precisam ser declaradas como ARG
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código da aplicação
COPY . .

# Build da aplicação Next.js
# As variáveis NEXT_PUBLIC_* serão embutidas no código durante o build
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Definir permissões
RUN chown -R nextjs:nodejs /app

# Usar usuário não-root
USER nextjs

# Expor porta (Railway usa variável $PORT dinamicamente)
# EXPOSE é apenas informativo - Railway usa $PORT
EXPOSE 3000

# Variável de ambiente
ENV NODE_ENV=production
# NÃO fixar PORT aqui - Railway define $PORT automaticamente
# O Next.js standalone lê process.env.PORT automaticamente

# Health check (usa $PORT do Railway)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD sh -c 'node -e "require(\"http\").get(\"http://localhost:\" + (process.env.PORT || 3000) + \"/\", (r) => {process.exit(r.statusCode === 200 || r.statusCode === 307 || r.statusCode === 308 ? 0 : 1)})"'

# Comando para iniciar
# Next.js standalone lê process.env.PORT automaticamente
# Railway define $PORT via variável de ambiente (pode ser 8080, 3000, etc)
CMD ["sh", "-c", "node server.js"]

