#!/bin/bash
# =============================================================================
# Tart VM — Daily Start/Stop/SSH Helper
#
# Usage:
#   ./tart-vm.sh start          # Start VM headless
#   ./tart-vm.sh stop           # Graceful shutdown
#   ./tart-vm.sh ssh            # SSH into the VM
#   ./tart-vm.sh claude         # SSH in and launch Claude Code autonomous
#   ./tart-vm.sh status         # Show VM state and IP
#   ./tart-vm.sh ip             # Print just the IP
#   ./tart-vm.sh docker-up      # SSH in, start Docker stack, exit
#   ./tart-vm.sh eval           # Full autonomous eval loop entrypoint
# =============================================================================

set -euo pipefail

VM_NAME="${VM_NAME:-osiris-dev}"
VM_USER="${VM_USER:-admin}"

case "${1:-help}" in
    start)
        if tart list 2>/dev/null | grep "$VM_NAME" | grep -q "running"; then
            echo "VM '$VM_NAME' is already running at $(tart ip $VM_NAME)"
            exit 0
        fi
        echo "Starting $VM_NAME..."
        tart run --no-graphics "$VM_NAME" &
        sleep 15
        VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "booting...")
        echo "VM running. SSH: ssh $VM_USER@$VM_IP"
        ;;

    stop)
        echo "Stopping $VM_NAME..."
        VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "")
        if [ -n "$VM_IP" ]; then
            ssh -o ConnectTimeout=3 "$VM_USER@$VM_IP" "sudo shutdown -h now" 2>/dev/null || true
            sleep 3
        fi
        tart stop "$VM_NAME" 2>/dev/null || true
        echo "Stopped."
        ;;

    ssh)
        VM_IP=$(tart ip "$VM_NAME")
        exec ssh "$VM_USER@$VM_IP"
        ;;

    claude)
        VM_IP=$(tart ip "$VM_NAME")
        echo "Launching Claude Code (autonomous) in $VM_NAME..."
        ssh -t "$VM_USER@$VM_IP" "cd ~/osiris && claude --dangerously-skip-permissions"
        ;;

    status)
        echo "VM: $VM_NAME"
        tart list 2>/dev/null | head -1
        tart list 2>/dev/null | grep "$VM_NAME" || echo "  Not found"
        VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "not running")
        echo "IP: $VM_IP"
        ;;

    ip)
        tart ip "$VM_NAME"
        ;;

    docker-up)
        VM_IP=$(tart ip "$VM_NAME")
        echo "Starting Docker stack inside VM..."
        ssh "$VM_USER@$VM_IP" "cd ~/osiris && docker compose up -d && docker compose ps"
        ;;

    eval)
        VM_IP=$(tart ip "$VM_NAME")
        echo "Starting autonomous eval loop in $VM_NAME..."
        echo "  Docker stack + Claude Code with --dangerously-skip-permissions"
        ssh -t "$VM_USER@$VM_IP" bash -c "'
            cd ~/osiris
            docker compose up -d
            sleep 10
            echo \"Docker stack ready. Launching Claude Code...\"
            claude --dangerously-skip-permissions
        '"
        ;;

    help|--help|-h)
        echo "Usage: $0 {start|stop|ssh|claude|status|ip|docker-up|eval}"
        echo ""
        echo "Commands:"
        echo "  start      Start VM headless"
        echo "  stop       Graceful shutdown"
        echo "  ssh        SSH into the VM"
        echo "  claude     SSH + launch Claude Code autonomous mode"
        echo "  status     Show VM state and IP"
        echo "  ip         Print VM IP address"
        echo "  docker-up  Start the Docker Compose stack inside VM"
        echo "  eval       Full entrypoint: docker up + claude autonomous"
        ;;

    *)
        echo "Unknown command: $1"
        echo "Run '$0 help' for usage."
        exit 1
        ;;
esac
