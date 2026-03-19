# Stage 1 — builder
FROM node:20-slim AS builder

WORKDIR /app

ARG VITE_GATEWAY_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

ARG VITE_GESTIONALE_URL
ENV VITE_GESTIONALE_URL=$VITE_GESTIONALE_URL

COPY package*.json ./
RUN npm ci

COPY . .

# Generate PWA icons (pure Python, no extra deps)
RUN python3 scripts/generate_icons.py

RUN npm run build

# Stage 2 — server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
