
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

FROM nginx:alpine

# Instalar paquetes necesarios para correr navegadores minimales
RUN apk add --no-cache ca-certificates

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configurar variables de entorno
ENV DOCKER_CONTAINER=true
ENV USE_ALTERNATIVE_BACKGROUND_REMOVAL=true
ENV RUNNING_IN_DOCKER=true

# Crear script de entrada con formato Unix y asegurar permisos
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'export DOCKER_CONTAINER=true' >> /entrypoint.sh && \
    echo 'export USE_ALTERNATIVE_BACKGROUND_REMOVAL=true' >> /entrypoint.sh && \
    echo 'export RUNNING_IN_DOCKER=true' >> /entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    dos2unix /entrypoint.sh 2>/dev/null || true

# Modificar la configuración de Nginx para pasar variables de entorno
RUN echo "\n\
# Agregar variables de entorno de Docker\n\
env DOCKER_CONTAINER;\n\
env USE_ALTERNATIVE_BACKGROUND_REMOVAL;\n\
env RUNNING_IN_DOCKER;\n\
" >> /etc/nginx/conf.d/default.conf

# Exponer el puerto 7170
EXPOSE 7170

# Comando para iniciar nginx con el script correcto
CMD ["/entrypoint.sh"]
