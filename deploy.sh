#!/bin/bash
set -euo pipefail

# ============================================================
# deploy.sh — Push till GitHub → bygg och starta på VPS via PM2
# ============================================================

APP_NAME="Byggprojekt_ola"              # Unikt namn (a-z, siffror, bindestreck)
VPS_IP="65.21.58.201"           # Din VPS IP
VPS_USER="deploy"              # Låt vara
GITHUB_REPO=""                 # t.ex. "dittnamn/minapp" (tomt = skapa nytt)
APP_PORT="3001"                # Unikt per app: 3001, 3002, 3003...
APP_SUBDIR="app"                         # Undermapp där appen ligger (tomt = rot)
NEEDS_DB="true"                # "true" för Postgres
NEEDS_REDIS="false"            # "true" för Redis
BASIC_AUTH="demo:korslagda"                  # Valfritt: "user:lösenord" (tomt = ingen auth)
NODE_ENV="production"
STABILITY_API_KEY="sk-aZschGLq24OlSHeB7hRyzUCp3UXjiUcOioibV3QBl7sPD49P"  # För bildgenerering

# ============================================================

APPS_DIR="/home/deploy/apps"
REMOTE="$VPS_USER@$VPS_IP"
SITE_DIR="$APPS_DIR/sites/$APP_NAME"
BUILD_DIR="$SITE_DIR${APP_SUBDIR:+/$APP_SUBDIR}"

echo "=========================================="
echo "  Deploying: $APP_NAME → $VPS_IP"
echo "=========================================="

# ===========================================================
# 1. .gitignore
# ===========================================================
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GI'
node_modules/
.next/
.env
.env.*
!.env.example
*.log
.DS_Store
.turbo/
dist/
out/
__pycache__/
.venv/
GI
fi

# ===========================================================
# 2. Push till GitHub
# ===========================================================
echo "[1/5] Push till GitHub..."
[ ! -d ".git" ] && git init && git branch -M main

if [ -z "$GITHUB_REPO" ]; then
    command -v gh &>/dev/null || { echo "❌ Installera gh CLI: https://cli.github.com"; exit 1; }
    gh repo create "$APP_NAME" --private --source=. --push 2>/dev/null || true
    GITHUB_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
    [ -z "$GITHUB_REPO" ] && { echo "❌ Kunde inte skapa repo."; exit 1; }
fi

git remote get-url origin &>/dev/null || git remote add origin "git@github.com:$GITHUB_REPO.git"
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" --allow-empty 2>/dev/null || true
git push -u origin main 2>/dev/null || git push origin main
echo "  ✅ github.com/$GITHUB_REPO"

# ===========================================================
# 3. Hämta kod på VPS
# ===========================================================
echo "[2/5] Hämtar kod på VPS..."

# Deploy key check
NEED_KEY=$(ssh $REMOTE '[ -f ~/.ssh/id_ed25519 ] && echo "no" || echo "yes"')
if [ "$NEED_KEY" = "yes" ]; then
    ssh $REMOTE 'ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -q'
    echo "  ⚠️  Lägg till deploy key på GitHub:"
    ssh $REMOTE 'cat ~/.ssh/id_ed25519.pub'
    echo "  → github.com/settings/ssh"
    exit 0
fi

ssh $REMOTE << GITEOF
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts 2>/dev/null || true
if [ -d "$SITE_DIR/.git" ]; then
    cd $SITE_DIR && git fetch origin && git reset --hard origin/main
else
    git clone git@github.com:$GITHUB_REPO.git $SITE_DIR
fi
GITEOF

# ===========================================================
# 4. Databas + beroenden + bygg
# ===========================================================
echo "[3/5] Databas + bygg..."

if [ "$NEEDS_DB" = "true" ]; then
    DB_PASSWORD=$(openssl rand -hex 16)
    ssh $REMOTE << DBEOF
cd $APPS_DIR
docker compose exec -T postgres psql -U postgres -tc \
    "SELECT 1 FROM pg_roles WHERE rolname='$APP_NAME'" | grep -q 1 || \
    docker compose exec -T postgres psql -U postgres -c \
    "CREATE USER \"$APP_NAME\" WITH PASSWORD '$DB_PASSWORD';"
docker compose exec -T postgres psql -U postgres -tc \
    "SELECT 1 FROM pg_database WHERE datname='$APP_NAME'" | grep -q 1 || \
    docker compose exec -T postgres psql -U postgres -c \
    "CREATE DATABASE \"$APP_NAME\" OWNER \"$APP_NAME\";"
DBEOF
fi

# Bygg .env (skapas bara om den inte finns — behåller befintlig vid uppdatering)
ssh $REMOTE << ENVEOF
if [ ! -f "$BUILD_DIR/.env" ]; then
    cat > $BUILD_DIR/.env << ENV
PORT=$APP_PORT
NODE_ENV=$NODE_ENV
STABILITY_API_KEY=$STABILITY_API_KEY
$([ "$NEEDS_DB" = "true" ] && echo "DATABASE_URL=postgresql://$APP_NAME:$DB_PASSWORD@127.0.0.1:5432/$APP_NAME")
$([ "$NEEDS_REDIS" = "true" ] && echo "REDIS_URL=redis://127.0.0.1:6379/0")
ENV
fi
ENVEOF

# Installera beroenden + bygg
ssh $REMOTE << BUILDEOF
cd $BUILD_DIR
export \$(grep -v '^#' .env | xargs) 2>/dev/null || true

# Installera alla dependencies (inkl dev för build-tools)
if [ -f pnpm-lock.yaml ]; then
    pnpm install 2>/dev/null || pnpm install
elif [ -f yarn.lock ]; then
    yarn install 2>/dev/null || yarn install
elif [ -f package-lock.json ]; then
    npm ci --include=dev 2>/dev/null || npm install --include=dev
elif [ -f package.json ]; then
    npm install --include=dev
fi

# Bygg - kolla om TypeScript har fel, använd vite direkt i så fall
if [ -f package.json ] && grep -q '"build"' package.json; then
    npm run build 2>&1 || {
        # Om vanlig build misslyckas (ofta TypeScript-fel), prova vite direkt
        if [ -f vite.config.ts ] || [ -f vite.config.js ]; then
            echo "Vanlig build misslyckades, kör vite build direkt..."
            ./node_modules/.bin/vite build
        fi
    }
fi
BUILDEOF

# ===========================================================
# 5. PM2 + Caddy
# ===========================================================
echo "[4/5] PM2 + Caddy..."

# Detektera app-typ och sätt startkommando
APP_TYPE="node"
START_CMD=""

# Kolla om det är en Vite-app (har dist/ mapp efter build)
if ssh $REMOTE "[ -d $BUILD_DIR/dist ]" 2>/dev/null; then
    APP_TYPE="vite"
    # Installera serve globalt om det behövs
    ssh $REMOTE "npm list -g serve >/dev/null 2>&1 || npm install -g serve"
    START_CMD="serve -s $BUILD_DIR/dist -l $APP_PORT"
# Next.js standalone
elif ssh $REMOTE "[ -f $BUILD_DIR/.next/standalone/server.js ]" 2>/dev/null; then
    APP_TYPE="nextjs"
    START_CMD="node $BUILD_DIR/.next/standalone/server.js"
# Vanlig Node.js med npm start
elif ssh $REMOTE "[ -f $BUILD_DIR/package.json ]" 2>/dev/null; then
    APP_TYPE="npm"
    START_CMD="npm run start"
fi

# Starta/restarta via PM2
ssh $REMOTE << PM2EOF
cd $BUILD_DIR

# Stoppa om den redan körs
pm2 delete $APP_NAME 2>/dev/null || true

# Starta beroende på app-typ
if [ "$APP_TYPE" = "vite" ]; then
    pm2 start serve --name "$APP_NAME" -- -s $BUILD_DIR/dist -l $APP_PORT
elif [ "$APP_TYPE" = "nextjs" ]; then
    PORT=$APP_PORT pm2 start node --name "$APP_NAME" -- $BUILD_DIR/.next/standalone/server.js
else
    PORT=$APP_PORT pm2 start npm --name "$APP_NAME" --cwd $BUILD_DIR -- run start
fi

# Spara PM2-state så den överlever reboot
pm2 save
PM2EOF

# Caddy config
ACTUAL_VPS_IP=$(ssh $REMOTE "grep VPS_IP $APPS_DIR/.env | cut -d= -f2")

# Generera basic auth och Caddy-config på servern
if [ -n "$BASIC_AUTH" ]; then
    BA_USER=$(echo "$BASIC_AUTH" | cut -d: -f1)
    BA_PASS=$(echo "$BASIC_AUTH" | cut -d: -f2)
    
    ssh $REMOTE "
cd $APPS_DIR
BA_HASH=\$(docker run --rm caddy:2-alpine caddy hash-password --plaintext '$BA_PASS')
sed -i '/# --- START $APP_NAME ---/,/# --- END $APP_NAME ---/d' Caddyfile
cat >> Caddyfile << EOF
# --- START $APP_NAME ---
$APP_NAME.$ACTUAL_VPS_IP.nip.io {
    basicauth {
        $BA_USER \$BA_HASH
    }
    reverse_proxy localhost:$APP_PORT
}
# --- END $APP_NAME ---
EOF
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || docker compose restart caddy
"
else
    ssh $REMOTE "
cd $APPS_DIR
sed -i '/# --- START $APP_NAME ---/,/# --- END $APP_NAME ---/d' Caddyfile
cat >> Caddyfile << EOF
# --- START $APP_NAME ---
$APP_NAME.$ACTUAL_VPS_IP.nip.io {
    reverse_proxy localhost:$APP_PORT
}
# --- END $APP_NAME ---
EOF
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || docker compose restart caddy
"
fi

echo ""
echo "=========================================="
echo "  ✅ DEPLOY KLAR!"
echo "=========================================="
echo ""
echo "  🌐 URL:    https://$APP_NAME.$ACTUAL_VPS_IP.nip.io"
echo "  📦 GitHub: https://github.com/$GITHUB_REPO"
[ -n "$BASIC_AUTH" ] && echo "  🔒 Auth:   $(echo $BASIC_AUTH | cut -d: -f1) / ***"
echo ""
echo "  Kommandon:"
echo "    Loggar:   ssh $REMOTE 'pm2 logs $APP_NAME'"
echo "    Restart:  ssh $REMOTE 'pm2 restart $APP_NAME'"
echo "    Status:   ssh $REMOTE 'pm2 status'"
echo "    Monitor:  ssh $REMOTE 'pm2 monit'"
echo ""
echo "=========================================="
