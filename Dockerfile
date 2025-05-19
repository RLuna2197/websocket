# Etapa 1: build
FROM node:23 as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run documentation  # genera la doc en /documentation

# Etapa 2: producción
FROM node:23-alpine as production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/documentation ./documentation
COPY package*.json ./
RUN npm install --omit=dev

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]