#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/AABABABABABABBABAABABABABABBA/is-this-site-ai-made.git"
INSTALL_DIR="${IS_THIS_SITE_AI_MADE_HOME:-$HOME/.is-this-site-ai-made}"
BIN_DIR="$HOME/.local/bin"
BIN_NAME="is-this-site-ai-made"

info() { printf '  %s\n' "$1"; }
die() { printf 'error: %s\n' "$1" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "node.js 18+ is required. install it from https://nodejs.org and run this again."
command -v git >/dev/null 2>&1 || die "git is required."

node_major=$(node -e 'console.log(process.versions.node.split(".")[0])')
[ "$node_major" -ge 18 ] || die "node.js 18+ is required, found $(node -v)."

info "installing is-this-site-ai-made to $INSTALL_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" pull --ff-only --quiet
else
  rm -rf "$INSTALL_DIR"
  git clone --quiet --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

info "installing dependencies (first run also downloads a headless chromium for the browser backend)"
( cd "$INSTALL_DIR" && npm install --no-audit --no-fund --silent )

mkdir -p "$BIN_DIR"
cat > "$BIN_DIR/$BIN_NAME" <<WRAPPER
#!/usr/bin/env bash
exec node "$INSTALL_DIR/bin/cli.js" "\$@"
WRAPPER
chmod +x "$BIN_DIR/$BIN_NAME"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    info "add $BIN_DIR to your PATH to run '$BIN_NAME' later (e.g. add this to your shell rc):"
    info "  export PATH=\"$BIN_DIR:\$PATH\""
    ;;
esac

info "installed."
echo

# piping this script into bash hands bash's stdin to curl, so the interactive
# prompt below needs to grab the real terminal back directly. `[ -r /dev/tty ]`
# can lie (the device node exists even with no controlling terminal at all),
# so actually try opening it in a subshell first.
if ( : < /dev/tty ) 2>/dev/null; then
  exec node "$INSTALL_DIR/bin/cli.js" < /dev/tty
else
  info "no terminal to attach to here, run '$BIN_NAME' yourself to start it."
fi
