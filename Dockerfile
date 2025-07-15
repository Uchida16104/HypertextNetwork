FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y apache2 nodejs npm grep net-tools

WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm install

COPY . /var/www/html/
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 3000
CMD ["/start.sh"]
