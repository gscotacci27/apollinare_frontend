# Stage 1 — builder
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_GATEWAY_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 — server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
