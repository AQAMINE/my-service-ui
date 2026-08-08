# ==========================================
# Étape 1 : Build de l'application Angular
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Copie des fichiers de dépendances pour bénéficier du cache Docker
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
# Remarque : Ajuste 'my-service-ui/browser' si le nom du projet diffère dans dist/
COPY --from=build /app/dist/my-service-ui/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]