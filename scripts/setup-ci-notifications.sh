#!/bin/bash

# Setup CI Notifications for CertRank
# This script configures notification channels and validates settings

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="${REPO_OWNER:-}"
REPO_NAME="${REPO_NAME:-}"
CONFIG_FILE=".github/ci-notifications.config.json"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    local deps=("gh" "jq" "curl")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

setup_github_auth() {
    log_info "Checking GitHub CLI authentication..."
    
    if ! gh auth status &> /dev/null; then
        log_warning "GitHub CLI is not authenticated"
        log_info "Please run: gh auth login"
        exit 1
    fi
    
    log_success "GitHub CLI is authenticated"
}

get_repo_info() {
    if [[ -z "$REPO_OWNER" || -z "$REPO_NAME" ]]; then
        log_info "Detecting repository information..."
        
        if git rev-parse --is-inside-work-tree &> /dev/null; then
            local origin_url=$(git config --get remote.origin.url)
            if [[ "$origin_url" =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
                REPO_OWNER="${BASH_REMATCH[1]}"
                REPO_NAME="${BASH_REMATCH[2]%.git}"
                log_success "Detected repository: $REPO_OWNER/$REPO_NAME"
            else
                log_error "Could not parse GitHub repository from origin URL: $origin_url"
                exit 1
            fi
        else
            log_error "Not in a git repository and REPO_OWNER/REPO_NAME not provided"
            exit 1
        fi
    fi
}

validate_config() {
    log_info "Validating configuration file..."
    
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
        log_error "Invalid JSON in configuration file: $CONFIG_FILE"
        exit 1
    fi
    
    log_success "Configuration file is valid"
}

setup_secrets() {
    log_info "Setting up GitHub repository secrets..."
    
    # Read configuration
    local slack_enabled=$(jq -r '.notifications.slack.enabled' "$CONFIG_FILE")
    local discord_enabled=$(jq -r '.notifications.discord.enabled' "$CONFIG_FILE")
    local email_enabled=$(jq -r '.notifications.email.enabled' "$CONFIG_FILE")
    
    # Setup Slack webhook
    if [[ "$slack_enabled" == "true" ]]; then
        log_info "Setting up Slack notifications..."
        read -s -p "Enter Slack webhook URL (or press Enter to skip): " slack_webhook
        echo
        
        if [[ -n "$slack_webhook" ]]; then
            if gh secret set SLACK_WEBHOOK_URL --body "$slack_webhook" --repo "$REPO_OWNER/$REPO_NAME"; then
                log_success "Slack webhook URL configured"
            else
                log_error "Failed to set Slack webhook URL"
            fi
        else
            log_warning "Skipping Slack webhook configuration"
        fi
    fi
    
    # Setup Discord webhook
    if [[ "$discord_enabled" == "true" ]]; then
        log_info "Setting up Discord notifications..."
        read -s -p "Enter Discord webhook URL (or press Enter to skip): " discord_webhook
        echo
        
        if [[ -n "$discord_webhook" ]]; then
            if gh secret set DISCORD_WEBHOOK_URL --body "$discord_webhook" --repo "$REPO_OWNER/$REPO_NAME"; then
                log_success "Discord webhook URL configured"
            else
                log_error "Failed to set Discord webhook URL"
            fi
        else
            log_warning "Skipping Discord webhook configuration"
        fi
    fi
    
    # Setup SendGrid for email notifications
    if [[ "$email_enabled" == "true" ]]; then
        log_info "Setting up email notifications..."
        read -s -p "Enter SendGrid API key (or press Enter to skip): " sendgrid_key
        echo
        
        if [[ -n "$sendgrid_key" ]]; then
            if gh secret set SENDGRID_API_KEY --body "$sendgrid_key" --repo "$REPO_OWNER/$REPO_NAME"; then
                log_success "SendGrid API key configured"
            else
                log_error "Failed to set SendGrid API key"
            fi
        else
            log_warning "Skipping SendGrid configuration"
        fi
    fi
}

test_notifications() {
    log_info "Testing notification setup..."
    
    # Create a test workflow dispatch
    log_info "Triggering test workflow to validate notifications..."
    
    if gh workflow run "notify-ci-status.yml" --repo "$REPO_OWNER/$REPO_NAME" 2>/dev/null; then
        log_success "Test workflow triggered successfully"
        log_info "Check your configured notification channels for test messages"
    else
        log_warning "Could not trigger test workflow (this is normal if the workflow doesn't support manual dispatch)"
    fi
}

show_status() {
    log_info "Current notification configuration:"
    echo
    
    # Check existing secrets
    local secrets=$(gh secret list --repo "$REPO_OWNER/$REPO_NAME" --json name --jq '.[].name')
    
    echo "🔐 Repository Secrets:"
    for secret in SLACK_WEBHOOK_URL DISCORD_WEBHOOK_URL SENDGRID_API_KEY; do
        if echo "$secrets" | grep -q "^$secret$"; then
            echo "  ✅ $secret"
        else
            echo "  ❌ $secret (not configured)"
        fi
    done
    
    echo
    echo "📋 Configured Notifications (from $CONFIG_FILE):"
    jq -r '
        .notifications | to_entries[] | 
        select(.value.enabled == true) | 
        "  ✅ " + (.key | ascii_upcase) + " notifications"
    ' "$CONFIG_FILE"
    
    echo
    echo "🔄 Monitored Workflows:"
    jq -r '.notifications.slack.workflows[]? // empty | "  • " + .' "$CONFIG_FILE"
}

main() {
    echo -e "${BLUE}🚀 CertRank CI Notification Setup${NC}"
    echo "======================================"
    echo
    
    check_dependencies
    setup_github_auth
    get_repo_info
    validate_config
    
    case "${1:-setup}" in
        "setup")
            setup_secrets
            test_notifications
            show_status
            ;;
        "status")
            show_status
            ;;
        "test")
            test_notifications
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Usage: $0 [setup|status|test]"
            exit 1
            ;;
    esac
    
    echo
    log_success "CI notification setup complete!"
    echo "View workflow status at: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
}

# Run main function with all arguments
main "$@"