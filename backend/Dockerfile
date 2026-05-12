FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libzip-dev zip unzip \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite
RUN sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/backend\/public/' /etc/apache2/sites-available/000-default.conf
RUN sed -i 's#<Directory /var/www/html>#<Directory /var/www/backend/public>#' /etc/apache2/apache2.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www
COPY . /var/www/backend

EXPOSE 80
CMD ["apache2-foreground"]
