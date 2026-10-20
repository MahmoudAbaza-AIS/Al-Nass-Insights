# Al-Nass Hospital UI — React + Vite
# Build context: ./frontend

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_DASHBOARD_PUBLIC_URL=https://dashboard.alnaseg.dynv6.net
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_DASHBOARD_PUBLIC_URL=$VITE_DASHBOARD_PUBLIC_URL

RUN npm run build

FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
