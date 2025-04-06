
FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias necesarias para WASM
RUN apk add --no-cache python3 make g++ 

# Aumentar límite de memoria de Node.js para procesamiento de imágenes
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de archivos del proyecto
COPY . .

# Configurar variable de entorno para transformers.js
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
RUN mkdir -p /app/.cache/transformers

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
