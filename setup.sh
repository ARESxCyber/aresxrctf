#!/bin/sh
# rCTF installation script

# http://127.0.0.1:8080/login?token=dX0eVsk0%2Bl6gQqW4lDKB%2FPWZcVxOBNf0DZBaV8%2F%2Bf3fCa589qzQzmqslUFrGOK%2BrwVEvcCd9B%2FwnO8zXbHsdtJNq5BGWipMqL71%2FqZCYLn%2FpTQSVUb%2BbA4wm5uQY

set -e

fg_cyan="\033[36m"
bold_fg_white="\033[1;37m"
bg_red="\033[41m"
reset="\033[0m"

error() {
  # shellcheck disable=SC2059
  printf "${bg_red}${bold_fg_white}%s %s${reset}\n" "[-]" "$*" 1>&2
}

info() {
  # shellcheck disable=SC2059
  printf "${fg_cyan}%s %s${reset}\n" "[*]" "$*"
}

get_key() {
  head -c 32 /dev/urandom | base64 -w 0
}

do_install() {
  info "Installing rCTF..."

  if [ ! "$(id -u)" = 0 ]; then
    error "You must run this script as root."
    exit 1
  fi

  if [ ! -x "$(command -v curl)" ]; then
    error "curl is not available. You must have curl to install rCTF."
    exit 1
  fi

  info "Configuring rCTF..."

  RCTF_GIT_REF="${RCTF_GIT_REF:-"main"}"

  mkdir -p rctf.d data/rctf-postgres data/rctf-redis

  printf "%s\n" \
  "RCTF_DATABASE_PASSWORD=$(get_key)" \
  "RCTF_REDIS_PASSWORD=$(get_key)" \
  "RCTF_GIT_REF=$RCTF_GIT_REF" \
  > .env

  printf "%s\n" \
  "ctfName: rCTF" \
  "meta:" \
  "  description: 'A description of your CTF'" \
  "  imageUrl: 'https://example.com'" \
  "homeContent: 'A description of your CTF. Markdown supported.'" \
  > rctf.d/01-ui.yaml

  printf "%s\n" \
  "origin: http://127.0.0.1:8080" \
  "divisions:" \
  "  open: Open" \
  "tokenKey: '$(get_key)'" \
  "startTime: $(date +%s)000" \
  "endTime: $(date -d +1week +%s)000" \
  > rctf.d/02-ctf.yaml

  printf "%s\n" \
  "database:" \
  "  sql:" \
  "    host: postgres" \
  "    user: rctf" \
  "    database: rctf" \
  "  redis:" \
  "    host: redis" \
  "  migrate: before" \
  > rctf.d/03-db.yaml

  info "Downloading rCTF..."

  curl -fsSO "https://raw.githubusercontent.com/otter-sec/rctf/$RCTF_GIT_REF/docker-compose.yml"
  docker compose pull

  info "Finished installation to ${RCTF_INSTALL_PATH}."

  printf "Would you like to start rCTF now (y/N)? "

  read -r result </dev/tty

  if [ "$result" = "y" ]; then
    info "Running 'docker compose up -d'..."
    docker compose up -d
    info "rCTF is now running at 127.0.0.1:8080."
    exit 0
  else
    info "If you would like to start rCTF, run 'docker compose up -d' in $RCTF_INSTALL_PATH."
    exit 0
  fi
}

do_install
