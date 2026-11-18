FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY public ./public
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data COOKIE_SECURE=1
VOLUME /data
EXPOSE 3000
CMD ["node", "server/server.js"]
