FROM php:7.4-fpm-buster

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    zip \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mysqli \
        mbstring \
        tokenizer \
        xml \
        ctype \
        json \
        bcmath \
        zip \
        intl \
        opcache \
        exif \
        gd \
        openssl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
