#!/bin/bash
docker stop byggprojekt_ola 2>/dev/null
docker rm byggprojekt_ola 2>/dev/null

# Generate bcrypt hash for basic auth (demo:korslagda)
AUTH_HASH='demo:$2y$05$/8kMcPcoSZbQidGMLtKZAepOFWaEhhO5PEGvgb/EnS7ybkag/xCg.'

# Use the old domain that already has SSL cert
docker run -d --name byggprojekt_ola \
  --network coolify \
  -e PORT=3002 \
  -e NODE_ENV=production \
  -e STABILITY_API_KEY=sk-aZschGLq24OlSHeB7hRyzUCp3UXjiUcOioibV3QBl7sPD49P \
  --label "traefik.enable=true" \
  --label 'traefik.http.routers.http-byggprojekt.entryPoints=http' \
  --label 'traefik.http.routers.http-byggprojekt.rule=Host(`byggprojekt.65.21.58.201.nip.io`)' \
  --label 'traefik.http.routers.http-byggprojekt.middlewares=redirect-to-https' \
  --label 'traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https' \
  --label 'traefik.http.routers.https-byggprojekt.entryPoints=https' \
  --label 'traefik.http.routers.https-byggprojekt.rule=Host(`byggprojekt.65.21.58.201.nip.io`)' \
  --label 'traefik.http.routers.https-byggprojekt.tls=true' \
  --label 'traefik.http.routers.https-byggprojekt.tls.certresolver=letsencrypt' \
  --label 'traefik.http.routers.https-byggprojekt.service=byggprojekt' \
  --label 'traefik.http.routers.https-byggprojekt.middlewares=byggprojekt-auth,gzip' \
  --label 'traefik.http.middlewares.gzip.compress=true' \
  --label "traefik.http.middlewares.byggprojekt-auth.basicauth.users=$AUTH_HASH" \
  --label 'traefik.http.services.byggprojekt.loadbalancer.server.port=3002' \
  byggprojekt_ola:latest
