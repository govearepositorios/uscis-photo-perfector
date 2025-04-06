
FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias necesarias para WASM y canvas
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev

# Aumentar límite de memoria de Node.js para procesamiento de imágenes
ENV NODE_OPTIONS=--max-old-space-size=8192

# Marcar explícitamente como entorno Docker
ENV DOCKER_CONTAINER=true
ENV USE_ALTERNATIVE_BACKGROUND_REMOVAL=true
ENV RUNNING_IN_DOCKER=true

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

# Instalar paquetes necesarios para correr navegadores minimales
RUN apk add --no-cache ca-certificates

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Pasar variables de entorno a través de nginx
RUN echo "\n\
# Agregar variables de entorno de Docker\n\
env DOCKER_CONTAINER;\n\
env USE_ALTERNATIVE_BACKGROUND_REMOVAL;\n\
env RUNNING_IN_DOCKER;\n\
" >> /etc/nginx/conf.d/default.conf

# Crear un script de inicio personalizado
RUN echo '#!/bin/sh\n\
export DOCKER_CONTAINER=true\n\
export USE_ALTERNATIVE_BACKGROUND_REMOVAL=true\n\
export RUNNING_IN_DOCKER=true\n\
nginx -g "daemon off;"\n\
' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx con variables de entorno
CMD ["/docker-entrypoint.sh"]
