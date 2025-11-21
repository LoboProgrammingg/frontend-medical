# ==============================================
# FRONTEND DOCKERFILE - PRODUÇÃO
# ==============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código da aplicação
COPY . .

# Build da aplicação Next.js
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

# Expor porta
EXPOSE 3000

# Variável de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar
CMD ["node", "server.js"]

