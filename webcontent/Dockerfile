FROM php:8.2-apache

RUN apt-get update \
&& apt-get install -y \
libzip-dev \
&& pecl install xdebug

RUN docker-php-ext-install opcache pdo_mysql zip
RUN docker-php-ext-enable opcache pdo_mysql zip
WORKDIR /tmp
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"
RUN composer require "phpunit/phpunit:^8" "yoast/phpunit-polyfills:^1.0" --prefer-source --no-interaction && \
    ln -s /tmp/vendor/bin/phpunit /usr/local/bin/phpunit
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN service apache2 restart

COPY ./site/ /var/www/html
RUN ls -laR /var/www/html*
RUN mkdir /tmp/vendor/bin/tests
COPY ./tests/ /tmp/vendor/bin/tests
RUN ls -laR /tmp/vendor/bin/tests*