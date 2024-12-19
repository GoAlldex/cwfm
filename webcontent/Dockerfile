FROM php:8.2-apache

RUN apt-get update \
&& apt-get install -y \
libzip-dev \
&& pecl install xdebug

RUN docker-php-ext-install opcache pdo_mysql zip
RUN docker-php-ext-enable opcache pdo_mysql zip
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN service apache2 restart

COPY ./site/ /var/www/html
RUN ls -laR /var/www/html*