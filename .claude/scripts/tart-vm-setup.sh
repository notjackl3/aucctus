#!/bin/bash
# =============================================================================
# Tart VM Setup — Fully Automated
#
# Creates an isolated Ubuntu VM on Apple Silicon with Docker, Node.js,
# Claude Code CLI, and uv pre-installed. Copies the osiris repo via rsync.
#
# Usage:
#   ./tart-vm-setup.sh                    # Use defaults
#   ./tart-vm-setup.sh --cpu 8 --ram 32   # Custom resources
#   ./tart-vm-setup.sh --destroy          # Delete existing VM and start fresh
#   ./tart-vm-setup.sh --golden           # Save a golden image after provisioning
#
# Prerequisites:
#   brew install cirruslabs/cli/tart
#   brew install hudochenkov/sshpass/sshpass
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration (override via flags or environment variables)
# ---------------------------------------------------------------------------
VM_NAME="${VM_NAME:-osiris-dev}"
BASE_IMAGE="${BASE_IMAGE:-ghcr.io/cirruslabs/ubuntu:latest}"
REPO_PATH="${REPO_PATH:-$HOME/GitRepos/osiris}"
VM_USER="${VM_USER:-admin}"
VM_PASS="${VM_PASS:-admin}"
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 -o LogLevel=ERROR"

# Auto-detect resources: half of physical cores and half of RAM
TOTAL_CPUS=$(sysctl -n hw.ncpu)
TOTAL_RAM_MB=$(( $(sysctl -n hw.memsize) / 1048576 ))
CPU_CORES="${CPU_CORES:-$(( TOTAL_CPUS / 2 ))}"
MEMORY_MB="${MEMORY_MB:-$(( TOTAL_RAM_MB / 2 ))}"
DISK_GB="${DISK_GB:-80}"

# Flags
DESTROY=false
GOLDEN=false
SKIP_PROVISION=false

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case $1 in
        --cpu)       CPU_CORES="$2"; shift 2 ;;
        --ram)       MEMORY_MB="$(( $2 * 1024 ))"; shift 2 ;;  # Accept GB, convert to MB
        --disk)      DISK_GB="$2"; shift 2 ;;
        --name)      VM_NAME="$2"; shift 2 ;;
        --repo)      REPO_PATH="$2"; shift 2 ;;
        --destroy)   DESTROY=true; shift ;;
        --golden)    GOLDEN=true; shift ;;
        --skip-provision) SKIP_PROVISION=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --cpu N          CPU cores (default: half of $(sysctl -n hw.ncpu))"
            echo "  --ram N          RAM in GB (default: half of $((TOTAL_RAM_MB / 1024)) GB)"
            echo "  --disk N         Disk in GB (default: 80)"
            echo "  --name NAME      VM name (default: osiris-dev)"
            echo "  --repo PATH      Repo path to sync into VM (default: ~/GitRepos/osiris)"
            echo "  --destroy        Delete existing VM before creating"
            echo "  --golden         Save a golden image after provisioning"
            echo "  --skip-provision Skip provisioning (use if already provisioned)"
            echo "  -h, --help       Show this help"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
echo "============================================"
echo "  Tart VM Setup — Isolated Dev Environment"
echo "============================================"
echo ""

# Check dependencies
for cmd in tart sshpass; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: '$cmd' not found. Install it:"
        if [ "$cmd" = "tart" ]; then
            echo "  brew install cirruslabs/cli/tart"
        elif [ "$cmd" = "sshpass" ]; then
            echo "  brew install hudochenkov/sshpass/sshpass"
        fi
        exit 1
    fi
done

# Check repo exists
if [ ! -d "$REPO_PATH" ]; then
    echo "ERROR: Repo not found at $REPO_PATH"
    echo "Set REPO_PATH or use --repo /path/to/osiris"
    exit 1
fi

echo "Configuration:"
echo "  VM Name:    $VM_NAME"
echo "  Base Image: $BASE_IMAGE"
echo "  CPUs:       $CPU_CORES / $TOTAL_CPUS"
echo "  RAM:        $((MEMORY_MB / 1024)) GB / $((TOTAL_RAM_MB / 1024)) GB"
echo "  Disk:       ${DISK_GB} GB"
echo "  Repo:       $REPO_PATH"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Handle existing VM
# ---------------------------------------------------------------------------
if tart list 2>/dev/null | grep -q "$VM_NAME"; then
    if [ "$DESTROY" = true ]; then
        echo "[1/8] Destroying existing VM '$VM_NAME'..."
        tart stop "$VM_NAME" 2>/dev/null || true
        sleep 2
        tart delete "$VM_NAME"
    else
        echo "[1/8] VM '$VM_NAME' already exists."
        echo "  Use --destroy to recreate, or --skip-provision to just start it."

        if [ "$SKIP_PROVISION" = true ]; then
            echo ""
            echo "Starting existing VM..."
            tart run --no-graphics "$VM_NAME" &
            TART_PID=$!
            sleep 15
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "unknown")
            echo ""
            echo "============================================"
            echo "  VM '$VM_NAME' is running"
            echo "============================================"
            echo "  SSH:     ssh ${VM_USER}@${VM_IP}"
            echo "  Repo:    ~/osiris (inside VM)"
            echo "  Stop:    tart stop $VM_NAME"
            echo "  PID:     $TART_PID"
            exit 0
        fi
        exit 1
    fi
else
    echo "[1/8] No existing VM found."
fi

# ---------------------------------------------------------------------------
# Step 2: Clone base image
# ---------------------------------------------------------------------------
echo "[2/8] Cloning base image (this downloads ~1.5 GB on first run)..."
tart clone "$BASE_IMAGE" "$VM_NAME"

# ---------------------------------------------------------------------------
# Step 3: Configure resources
# ---------------------------------------------------------------------------
echo "[3/8] Configuring resources..."
tart set "$VM_NAME" --cpu "$CPU_CORES" --memory "$MEMORY_MB" --disk-size "$DISK_GB"

# ---------------------------------------------------------------------------
# Step 4: Start VM headless
# ---------------------------------------------------------------------------
echo "[4/8] Starting VM headlessly..."
tart run --no-graphics "$VM_NAME" &
TART_PID=$!

# Wait for VM to boot
echo "  Waiting for VM to boot..."
sleep 10

# Wait for SSH to become available (up to 2 minutes)
VM_IP=""
for i in $(seq 1 24); do
    VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "")
    if [ -n "$VM_IP" ]; then
        if sshpass -p "$VM_PASS" ssh $SSH_OPTS "$VM_USER@$VM_IP" "echo ready" &>/dev/null; then
            echo "  SSH ready at $VM_IP (attempt $i)"
            break
        fi
    fi
    if [ "$i" -eq 24 ]; then
        echo "ERROR: SSH did not become available after 2 minutes."
        echo "  Try: tart stop $VM_NAME && tart run $VM_NAME (GUI mode to debug)"
        kill "$TART_PID" 2>/dev/null || true
        exit 1
    fi
    echo "  Waiting for SSH... (attempt $i/24)"
    sleep 5
done

# ---------------------------------------------------------------------------
# Step 5: Provision
# ---------------------------------------------------------------------------
if [ "$SKIP_PROVISION" = true ]; then
    echo "[5/8] Skipping provisioning (--skip-provision)"
else
    echo "[5/8] Provisioning VM (this takes 3-5 minutes)..."

    sshpass -p "$VM_PASS" ssh $SSH_OPTS "$VM_USER@$VM_IP" << 'PROVISION_SCRIPT'
#!/bin/bash
set -euo pipefail

echo ">>> System updates..."
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

# ---- Docker Engine ----
echo ">>> Installing Docker..."
sudo apt-get install -y -qq ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER

# ---- Node.js LTS ----
echo ">>> Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - 2>/dev/null
sudo apt-get install -y -qq nodejs

# ---- Claude Code CLI ----
echo ">>> Installing Claude Code CLI..."
sudo npm install -g @anthropic-ai/claude-code 2>/dev/null

# ---- uv (Python package manager) ----
echo ">>> Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh 2>/dev/null
echo 'source $HOME/.local/bin/env' >> ~/.bashrc

# ---- Dev tools ----
echo ">>> Installing dev tools..."
sudo apt-get install -y -qq \
  git build-essential \
  python3 python3-pip python3-venv \
  curl wget jq htop tmux \
  openssh-server

sudo systemctl enable ssh

# ---- Verify ----
echo ""
echo ">>> Verification:"
echo "  Docker:      $(docker --version 2>/dev/null || echo 'FAILED')"
echo "  Node.js:     $(node --version 2>/dev/null || echo 'FAILED')"
echo "  npm:         $(npm --version 2>/dev/null || echo 'FAILED')"
echo "  Claude Code: $(claude --version 2>/dev/null || echo 'FAILED')"
echo "  git:         $(git --version 2>/dev/null || echo 'FAILED')"
echo "  python3:     $(python3 --version 2>/dev/null || echo 'FAILED')"
echo ""
echo ">>> Provisioning complete!"
PROVISION_SCRIPT

fi

# ---------------------------------------------------------------------------
# Step 6: Set up SSH key (passwordless access)
# ---------------------------------------------------------------------------
echo "[6/8] Setting up SSH key..."
if [ -f "$HOME/.ssh/id_ed25519.pub" ]; then
    sshpass -p "$VM_PASS" ssh-copy-id -i "$HOME/.ssh/id_ed25519.pub" $SSH_OPTS "$VM_USER@$VM_IP" 2>/dev/null
    echo "  SSH key copied. You can now: ssh ${VM_USER}@${VM_IP}"
elif [ -f "$HOME/.ssh/id_rsa.pub" ]; then
    sshpass -p "$VM_PASS" ssh-copy-id -i "$HOME/.ssh/id_rsa.pub" $SSH_OPTS "$VM_USER@$VM_IP" 2>/dev/null
    echo "  SSH key copied. You can now: ssh ${VM_USER}@${VM_IP}"
else
    echo "  No SSH key found. Using password auth (admin/admin)."
    echo "  Generate one: ssh-keygen -t ed25519"
fi

# ---------------------------------------------------------------------------
# Step 7: Copy repo into VM
# ---------------------------------------------------------------------------
echo "[7/8] Syncing repo into VM..."
rsync -az --exclude='.git' --exclude='node_modules' --exclude='.venv' --exclude='__pycache__' \
    -e "ssh $SSH_OPTS" "$REPO_PATH/" "$VM_USER@$VM_IP:~/osiris/"
echo "  Repo copied to ~/osiris inside VM."

# ---------------------------------------------------------------------------
# Step 8: Save golden image (optional)
# ---------------------------------------------------------------------------
if [ "$GOLDEN" = true ]; then
    echo "[8/8] Saving golden image..."
    # Stop VM to take clean snapshot
    sshpass -p "$VM_PASS" ssh $SSH_OPTS "$VM_USER@$VM_IP" "sudo shutdown -h now" 2>/dev/null || true
    sleep 5
    kill "$TART_PID" 2>/dev/null || true
    wait "$TART_PID" 2>/dev/null || true

    GOLDEN_NAME="${VM_NAME}-golden"
    tart delete "$GOLDEN_NAME" 2>/dev/null || true
    tart clone "$VM_NAME" "$GOLDEN_NAME"
    echo "  Golden image saved as '$GOLDEN_NAME'"
    echo "  Restore with: tart clone $GOLDEN_NAME $VM_NAME"
    echo ""

    # Restart the VM
    echo "  Restarting VM..."
    tart run --no-graphics "$VM_NAME" &
    TART_PID=$!
    sleep 15
    VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "unknown")
else
    echo "[8/8] Skipping golden image (use --golden to save one)"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================"
echo "  VM '$VM_NAME' is ready!"
echo "============================================"
echo ""
echo "  SSH:          ssh ${VM_USER}@${VM_IP}"
echo "  Repo inside:  ~/osiris"
echo "  Tart PID:     $TART_PID"
echo ""
echo "  Quick start inside the VM:"
echo "    cd ~/osiris"
echo "    docker compose up -d"
echo "    claude --dangerously-skip-permissions"
echo ""
echo "  Stop VM:      tart stop $VM_NAME"
echo "  Start again:  tart run --no-graphics $VM_NAME &"
echo ""
echo "  Sync repo:    rsync -az --exclude='.git' --exclude='node_modules' --exclude='.venv' --exclude='__pycache__' $REPO_PATH/ ${VM_USER}@${VM_IP}:~/osiris/"
echo ""
echo "  NOTE: Log out/in once inside the VM for docker group."
echo "        API keys are read from .env files in the repo by Docker Compose"
echo ""
