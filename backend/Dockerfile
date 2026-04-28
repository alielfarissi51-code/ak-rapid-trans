FROM php:8.3-cli-bookworm

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND=noninteractive \
    COMPOSER_ALLOW_SUPERUSER=1 \
    APP_ENV=production \
    APP_DEBUG=false \
    PORT=10000

# Install system packages required by Laravel, PDF generation, and optional OCR support.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    curl \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-fra \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" \
    pdo \
    pdo_mysql \
    mbstring \
    bcmath \
    intl \
    zip \
    gd \
    exif \
    pcntl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install Composer from the official Composer image.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy the full Laravel application into the image.
COPY . .

# Install production dependencies only.
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Ensure Laravel can write to storage and cache directories.
RUN mkdir -p storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R ug+rwX storage bootstrap/cache

# Build optimized caches for faster production boot.
RUN php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Render routes traffic to this container on PORT, defaulting to 10000.
EXPOSE 10000

# Laravel's built-in server serves the public/ directory, so public/index.php is exposed correctly.
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]