#!/usr/bin/env bash
# One-time setup on the VPS: makes the website follow the GitHub repo.
# After this, every push to the repo is live within about a minute.
#
#   sudo bash setup-vps.sh              # finds the web root by itself
#   sudo bash setup-vps.sh /var/www/x   # or tell it where the site lives
#
# What it does:
#   1. clones the repo to /opt/bambuu-site (outside the web root)
#   2. backs up the files it is about to replace
#   3. copies the repo's public/ folder into the web root
#   4. installs a timer that repeats steps 1 and 3 every minute when the repo changed
# It does not change the web server's configuration.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/bambuuswe/bambuu.site.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-bambuu.site}"
CLONE_DIR="${CLONE_DIR:-/opt/bambuu-site}"
DEPLOY_BIN="${DEPLOY_BIN:-/usr/local/bin/bambuu-site-deploy}"
NO_TIMER="${NO_TIMER:-}"          # set to 1 to skip the timer (used for dry runs)
WEB_ROOT="${1:-}"

say() { printf '\n==> %s\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

[ -n "$NO_TIMER" ] || [ "$(id -u)" -eq 0 ] || die "Run this with sudo."

if ! command -v git >/dev/null 2>&1; then
  say "Installing git"
  if   command -v apt-get >/dev/null 2>&1; then apt-get update -qq && apt-get install -y -qq git
  elif command -v dnf     >/dev/null 2>&1; then dnf install -y -q git
  elif command -v yum     >/dev/null 2>&1; then yum install -y -q git
  elif command -v apk     >/dev/null 2>&1; then apk add --quiet git
  else die "Could not install git automatically. Install it and run this again."; fi
fi

# ---- find the folder the web server serves ----
find_web_root() {
  local list="" c
  if command -v nginx >/dev/null 2>&1; then
    list+=$(nginx -T 2>/dev/null | sed -n 's/^[[:space:]]*root[[:space:]]\+\([^;]*\);.*/\1/p' || true)$'\n'
  fi
  list+=$(grep -rhsiE '^[[:space:]]*DocumentRoot[[:space:]]' /etc/apache2 /etc/httpd 2>/dev/null | awk '{print $2}' | tr -d '"' || true)$'\n'
  list+=$(grep -rhsE '^[[:space:]]*root[[:space:]]+\*[[:space:]]' /etc/caddy 2>/dev/null | awk '{print $3}' || true)$'\n'
  list+="/var/www/$DOMAIN"$'\n'"/var/www/$DOMAIN/html"$'\n'"/var/www/$DOMAIN/public"$'\n'"/var/www/html"$'\n'"/usr/share/nginx/html"$'\n'

  local found=()
  while IFS= read -r c; do
    [ -n "$c" ] && [ -f "$c/index.html" ] || continue
    case " ${found[*]-} " in *" $c "*) ;; *) found+=("$c") ;; esac
  done <<< "$list"

  # prefer a folder named after the domain
  local named=()
  for c in "${found[@]-}"; do case "$c" in *"$DOMAIN"*) named+=("$c") ;; esac; done
  [ "${#named[@]}" -eq 1 ] && { echo "${named[0]}"; return; }
  [ "${#found[@]}" -eq 1 ] && [ -n "${found[0]}" ] && { echo "${found[0]}"; return; }

  {
    echo
    echo "Could not tell which folder is the website. Candidates:"
    for c in "${found[@]-}"; do [ -n "$c" ] && echo "   $c"; done
    echo "Run this again with the right folder, for example:"
    echo "   sudo bash setup-vps.sh /var/www/$DOMAIN"
  } >&2
  return 1
}

if [ -z "$WEB_ROOT" ]; then WEB_ROOT=$(find_web_root) || exit 1; fi
WEB_ROOT="${WEB_ROOT%/}"
[ -d "$WEB_ROOT" ] || die "$WEB_ROOT is not a folder."
say "Web root: $WEB_ROOT"

# ---- get the repo ----
if [ -d "$CLONE_DIR/.git" ]; then
  say "Updating the existing clone in $CLONE_DIR"
  git -C "$CLONE_DIR" remote set-url origin "$REPO_URL"
  git -C "$CLONE_DIR" fetch --quiet origin "$BRANCH"
  git -C "$CLONE_DIR" reset --quiet --hard "origin/$BRANCH"
else
  say "Cloning $REPO_URL to $CLONE_DIR"
  git clone --quiet --branch "$BRANCH" "$REPO_URL" "$CLONE_DIR"
fi
[ -f "$CLONE_DIR/public/index.html" ] || die "The repo has no public/index.html."
rm -f "$CLONE_DIR/.deployed"

# ---- back up whatever is about to be replaced ----
BACKUP="${CLONE_DIR}-backup-$(date +%Y%m%d-%H%M%S)"
( cd "$CLONE_DIR/public" && find . -type f ) | while IFS= read -r f; do
  if [ -f "$WEB_ROOT/$f" ]; then mkdir -p "$BACKUP/$(dirname "$f")"; cp -a "$WEB_ROOT/$f" "$BACKUP/$f"; fi
done
[ -d "$BACKUP" ] && say "Old files saved in $BACKUP"

# ---- the deploy command the timer runs ----
say "Installing $DEPLOY_BIN"
cat > "$DEPLOY_BIN" <<EOF
#!/usr/bin/env bash
# Pulls the repo and copies public/ into the web root when something changed.
set -euo pipefail
cd "$CLONE_DIR"
git fetch --quiet origin "$BRANCH"
new=\$(git rev-parse "origin/$BRANCH")
if [ "\$new" != "\$(cat .deployed 2>/dev/null || true)" ]; then
  git reset --quiet --hard "origin/$BRANCH"
  cp -a public/. "$WEB_ROOT/"
  echo "\$new" > .deployed
  echo "deployed \$new"
fi
EOF
chmod 755 "$DEPLOY_BIN"

say "First deploy"
"$DEPLOY_BIN"

# ---- run it every minute ----
if [ -n "$NO_TIMER" ]; then
  say "Skipping the timer (NO_TIMER is set)"
elif command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  cat > /etc/systemd/system/bambuu-site-deploy.service <<EOF
[Unit]
Description=Update $DOMAIN from its git repo
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=$DEPLOY_BIN
EOF
  cat > /etc/systemd/system/bambuu-site-deploy.timer <<EOF
[Unit]
Description=Check the $DOMAIN repo every minute

[Timer]
OnBootSec=30s
OnUnitActiveSec=60s
AccuracySec=5s

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable --now bambuu-site-deploy.timer >/dev/null
  say "Timer installed (systemd). See runs with: journalctl -u bambuu-site-deploy"
else
  echo "* * * * * root $DEPLOY_BIN >/dev/null 2>&1" > /etc/cron.d/bambuu-site-deploy
  chmod 644 /etc/cron.d/bambuu-site-deploy
  say "Timer installed (cron)."
fi

say "Done. $WEB_ROOT now follows $REPO_URL ($BRANCH)."
