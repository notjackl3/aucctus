# Tart VM Setup — Isolated Dev Environment for Autonomous Claude Code

This guide sets up a fully isolated Ubuntu VM on Apple Silicon (M4) using [Tart](https://tart.run/) (Apple Virtualization.framework). The VM runs Docker, Node.js, and Claude Code CLI with full network access for LLM API calls, while your host repo is mounted read-write via VirtioFS.

## Prerequisites

| Requirement | Check |
|-------------|-------|
| macOS 13+ (Ventura or later) | `sw_vers` |
| Homebrew | `brew --version` |
| ~50 GB free disk space | `df -h /` |
| Anthropic API key | `echo $ANTHROPIC_API_KEY` |

Set `OSIRIS_PATH` to wherever you cloned the osiris repo (used throughout this guide):

```bash
export OSIRIS_PATH="$HOME/GitRepos/osiris"  # adjust to your clone location
```

## Part 1: Install Tart

```bash
brew install cirruslabs/cli/tart
brew install hudochenkov/sshpass/sshpass   # For automated SSH provisioning
tart --version
```

Verify: You should see a version like `2.x.x`.

## Part 2: Create the VM

```bash
# Pull the Ubuntu ARM64 base image and create a VM named "osiris-dev"
tart clone ghcr.io/cirruslabs/ubuntu:latest osiris-dev
```

This downloads ~1.5 GB. Default credentials: `admin` / `admin`.

## Part 3: Configure Resources

Allocate roughly half your physical cores and half your RAM. For a 12-core / 32 GB M4 MacBook Pro:

```bash
tart set osiris-dev --cpu 6 --memory 16384 --disk-size 80
```

| Setting | Value | Notes |
|---------|-------|-------|
| `--cpu` | 6 | Half of 12 cores |
| `--memory` | 16384 | 16 GB in MB |
| `--disk-size` | 80 | 80 GB (Docker images + DB data) |

Adjust to your machine. Check your specs with `sysctl -n hw.ncpu` and `sysctl -n hw.memsize`.

## Part 4: Start the VM

```bash
# Start headless with your osiris repo mounted
tart run --no-graphics --dir=osiris:$OSIRIS_PATH osiris-dev &

# Wait for boot
sleep 20

# Get the VM's IP address
tart ip osiris-dev
```

Write down the IP. It's typically `192.168.64.x`.

## Part 5: SSH In

```bash
ssh admin@$(tart ip osiris-dev)
# Password: admin
```

First time: accept the host key fingerprint.

**Recommended:** Set up passwordless SSH:

```bash
ssh-copy-id admin@$(tart ip osiris-dev)
```

## Part 6: Provision the VM (Inside SSH)

Run these commands inside the VM. Copy-paste each section.

### 6a. System Updates

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 6b. Install Docker Engine

```bash
# Prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Docker repo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add yourself to docker group (no sudo for docker commands)
sudo usermod -aG docker $USER
```

### 6c. Install Node.js LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 6d. Install Claude Code CLI

```bash
sudo npm install -g @anthropic-ai/claude-code
```

### 6e. Install Dev Tools

```bash
sudo apt-get install -y \
  git build-essential \
  python3 python3-pip python3-venv \
  curl wget jq htop tmux \
  openssh-server

sudo systemctl enable ssh
```

### 6f. Install uv (Python package manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### 6g. Mount Shared Folder Permanently

```bash
sudo mkdir -p /mnt/shared
echo "com.apple.virtio-fs.automount /mnt/shared virtiofs rw,relatime 0 0" | sudo tee -a /etc/fstab
sudo mount -a

# Verify
ls /mnt/shared/osiris/
```

You should see the osiris repo contents.

### 6h. Log Out and Back In

```bash
exit
```

Then SSH back in so the docker group takes effect:

```bash
ssh admin@$(tart ip osiris-dev)
```

## Part 7: Verify Everything Works

```bash
# Docker
docker run --rm hello-world

# Node / Claude Code
node --version
claude --version

# Python / uv
uv --version

# Shared folder
ls /mnt/shared/osiris/projects/server/

# Network (LLM APIs reachable)
curl -s -o /dev/null -w "%{http_code}" https://api.anthropic.com/
```

All should succeed. The curl should return `401` (unauthorized but reachable).

## Part 8: Start the Osiris Stack

```bash
cd /mnt/shared/osiris

# Start Docker services
docker compose up -d

# Wait for services
sleep 10

# Verify
docker compose ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/
```

## Part 9: Run Claude Code Autonomously

```bash
cd /mnt/shared/osiris

# Fully autonomous mode (no permission prompts)
claude --dangerously-skip-permissions
```

Inside Claude Code, you can now run the eval loop, modify prompts, restart the API container, curl endpoints, and iterate — all inside the isolated VM.

## Part 10: Save as Golden Image

Once provisioned, save the VM so you never have to repeat this:

```bash
# From the HOST Mac (not inside the VM)

# Stop the VM gracefully
ssh admin@$(tart ip osiris-dev) "sudo shutdown -h now"
sleep 5

# Clone as a golden image
tart clone osiris-dev osiris-dev-golden

# Optional: push to a registry for sharing
tart login ghcr.io
tart push osiris-dev ghcr.io/YOUR_USERNAME/osiris-dev:v1.0
```

To restore from golden:

```bash
tart delete osiris-dev
tart clone osiris-dev-golden osiris-dev
```

## Daily Workflow

```bash
# Start (from host Mac)
tart run --no-graphics --dir=osiris:$OSIRIS_PATH osiris-dev &
sleep 15

# SSH in
ssh admin@$(tart ip osiris-dev)

# Inside VM
cd /mnt/shared/osiris
docker compose up -d
claude --dangerously-skip-permissions

# When done
sudo shutdown -h now
```

## Quick Reference

| Task | Command |
|------|---------|
| List VMs | `tart list` |
| Get VM config | `tart get osiris-dev` |
| Get VM IP | `tart ip osiris-dev` |
| Start (headless) | `tart run --no-graphics --dir=osiris:$OSIRIS_PATH osiris-dev &` |
| Start (GUI) | `tart run --dir=osiris:$OSIRIS_PATH osiris-dev` |
| Stop | `tart stop osiris-dev` |
| Delete | `tart delete osiris-dev` |
| Clone/snapshot | `tart clone osiris-dev osiris-dev-snapshot` |
| Push to registry | `tart push osiris-dev ghcr.io/user/img:tag` |

## Troubleshooting

**VM won't start:** Check if another instance is running — `tart list` shows state. `tart stop osiris-dev` to force stop.

**SSH refused:** VM may still be booting. Wait 30s and retry. Check `tart ip osiris-dev` returns an IP.

**Shared folder empty:** Mount may not be active. Inside VM: `sudo mount -t virtiofs com.apple.virtio-fs.automount /mnt/shared`.

**Docker permission denied:** Log out and back in after `usermod -aG docker`. Or use `newgrp docker`.

**Slow I/O on shared folder:** Keep `node_modules`, `.venv`, and database data on the VM's local disk, not the shared mount. Only the source code should live on the mount.

**DHCP lease exhaustion (many VM create/destroy cycles):** `sudo defaults write /Library/Preferences/SystemConfiguration/com.apple.vmnet.plist Shared_Net_Lease_Time -int 600`
