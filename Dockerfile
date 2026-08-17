# ==========================================
# Étape 1 : Build de l'application Angular (Node 24 pour Angular v19+/v20+)
# ==========================================
FROM node:24-alpine AS build
WORKDIR /app

# Copie des fichiers de dépendances pour le cache Docker
COPY package*.json ./
RUN npm ci

# Copie du reste des sources
COPY . .

# Build de production
RUN npm run build -- --configuration production

# ==========================================
# Étape 2 : Servir avec Nginx (Image légère)
# ==========================================
FROM nginx:alpine

# Copie de la configuration Nginx sur mesure
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du bundle généré par Angular
COPY --from=build /app/dist/my-service-ui/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]