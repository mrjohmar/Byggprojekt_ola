#!/bin/bash
docker stop byggprojekt_ola 2>/dev/null
docker rm byggprojekt_ola 2>/dev/null

# Generate bcrypt hash for basic auth (demo:korslagda)
# Using pre-generated hash compatible with Traefik
AUTH_HASH='demo:$2y$05$/8kMcPcoSZbQidGMLtKZAepOFWaEhhO5PEGvgb/EnS7ybkag/xCg.'

docker run -d --name byggprojekt_ola \
  --network coolify \
  -e PORT=3002 \
  -e NODE_ENV=production \
  -e STABILITY_API_KEY=sk-aZschGLq24OlSHeB7hRyzUCp3UXjiUcOioibV3QBl7sPD49P \
  --label "traefik.enable=true" \
  --label 'traefik.http.routers.http-byggprojekt-ola.entryPoints=http' \
  --label 'traefik.http.routers.http-byggprojekt-ola.rule=Host(`byggprojekt-ola.65.21.58.201.nip.io`)' \
  --label 'traefik.http.routers.http-byggprojekt-ola.middlewares=redirect-to-https' \
  --label 'traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https' \
  --label 'traefik.http.routers.https-byggprojekt-ola.entryPoints=https' \
  --label 'traefik.http.routers.https-byggprojekt-ola.rule=Host(`byggprojekt-ola.65.21.58.201.nip.io`)' \
  --label 'traefik.http.routers.https-byggprojekt-ola.tls=true' \
  --label 'traefik.http.routers.https-byggprojekt-ola.tls.certresolver=letsencrypt' \
  --label 'traefik.http.routers.https-byggprojekt-ola.service=byggprojekt-ola' \
  --label 'traefik.http.routers.https-byggprojekt-ola.middlewares=byggprojekt-ola-auth,gzip' \
  --label 'traefik.http.middlewares.gzip.compress=true' \
  --label "traefik.http.middlewares.byggprojekt-ola-auth.basicauth.users=$AUTH_HASH" \
  --label 'traefik.http.services.byggprojekt-ola.loadbalancer.server.port=3002' \
  byggprojekt_ola:latest
