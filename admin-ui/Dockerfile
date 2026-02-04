# Hafif Node.js imajı kullan
FROM node:20-alpine

WORKDIR /app

# Paket listesini kopyala
COPY package*.json ./

# Bağımlılıkları yükle (Express ve SQLite ekliyoruz)
# --legacy-peer-deps bazen versiyon uyuşmazlığını çözer
RUN npm install && npm install express sqlite3 sqlite

# Tüm proje dosyalarını kopyala
COPY . .

# Vite ile frontend'i derle (build klasörü oluşturur: /dist)
RUN npm run build

# Uygulama portunu aç
EXPOSE 3000

# Sunucuyu başlat
CMD ["node", "server.js"]