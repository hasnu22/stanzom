#!/bin/bash
# Initial SSL certificate setup for Stanzom
# Run this ONCE on first deployment before enabling HTTPS in nginx

set -e

DOMAINS=("api.stanzom.com" "admin.stanzom.com")
EMAIL="${1:?Usage: ./init-ssl.sh your-email@example.com}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Stanzom SSL Setup ==="

# Start nginx with HTTP only (for ACME challenge)
echo "Starting nginx for ACME challenge..."
docker compose -f $COMPOSE_FILE up -d nginx

sleep 5

# Issue certificates for each domain
for DOMAIN in "${DOMAINS[@]}"; do
    echo "Issuing certificate for $DOMAIN..."
    docker compose -f $COMPOSE_FILE run --rm certbot \
        certbot certonly --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --force-renewal
done

# Reload nginx to pick up certificates
echo "Reloading nginx..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

echo "=== SSL setup complete ==="
echo "Certificates issued for: ${DOMAINS[*]}"
echo "Auto-renewal is handled by the certbot container."
