FROM php:7.1-fpm

RUN apt-get update && \
    apt-get install -y \
        git \
        unzip \
        libzip-dev

RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip

RUN php -r "copy('https://getcomposer.org/download/1.10.22/composer.phar', 'composer.phar');" && \
    chmod +x composer.phar && \
    mv composer.phar /usr/local/bin/composer

WORKDIR /var/www