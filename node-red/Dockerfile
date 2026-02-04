# Resmi Node-RED sürümünü temel al
FROM nodered/node-red:3.1

# Root yetkisiyle işlem yap (Sorun çıkmasın diye)
USER root

# Eksik olan o muhteşem üçlüyü yükle
RUN npm install node-red-contrib-opcua \
    node-red-contrib-influxdb \
    node-red-node-sqlite

# (Opsiyonel) Tekrar node kullanıcısına dönülebilir ama
# biz compose dosyasında zaten "user: root" dediğimiz için gerek yok.