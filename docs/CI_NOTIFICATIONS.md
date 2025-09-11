# CI/CD Notification System

The CertRank CI notification system provides comprehensive monitoring and alerting for all CI/CD pipeline activities.

## Features

### 🔔 Multi-Channel Notifications
- **Slack Integration**: Real-time notifications to team channels
- **Discord Webhooks**: Community and development team alerts  
- **Email Alerts**: Critical failure notifications to key stakeholders
- **GitHub Issues**: Automatic issue creation for repeated failures

### 📊 Status Dashboard
- Real-time pipeline status monitoring
- Visual indicators for build health
- Integration with frontend application
- Historical trend tracking

### 🚨 Smart Alerting
- Failure escalation based on criticality
- Repeated failure detection and auto-issue creation
- Context-aware notifications with commit and actor information
- Customizable notification rules per workflow

## Configuration

### Setup Script
Run the automated setup script to configure notifications:

```bash
./scripts/setup-ci-notifications.sh setup
```

### Manual Configuration
1. **Create GitHub Secrets** in your repository:
   - `SLACK_WEBHOOK_URL`: Slack incoming webhook URL
   - `DISCORD_WEBHOOK_URL`: Discord webhook URL  
   - `SENDGRID_API_KEY`: SendGrid API key for email notifications

2. **Configure Workflows** in `.github/ci-notifications.config.json`:
   ```json
   {
     "notifications": {
       "slack": {
         "enabled": true,
         "channel": "#certify-ci",
         "workflows": ["Domain Validation", "Frontend Build"]
       }
     }
   }
   ```

## Monitored Workflows

The system monitors these critical workflows:

| Workflow | Purpose | Notification Level |
|----------|---------|-------------------|
| **Domain Validation** | Ensures domain consistency | Critical |
| **Data Pipeline CI** | Validates data processing | Critical |
| **Frontend Build** | Application build/deployment | Standard |
| **Security Scan** | Vulnerability scanning | Standard |
| **Performance Tests** | Performance regression testing | Standard |

## Notification Types

### 🟢 Success Notifications
- Workflow completion confirmations
- Deployment success alerts
- Performance benchmark achievements

### 🔴 Failure Notifications  
- Immediate failure alerts with context
- Failed test summaries
- Build artifact issues
- Security vulnerabilities

### 🟡 Warning Notifications
- Long-running builds
- Performance degradation
- Dependency updates required

### 🚨 Critical Alerts
- Repeated failures (3+ in 24 hours)
- Production deployment failures
- Security critical issues
- Infrastructure problems

## Notification Channels

### Slack Integration
```yaml
# Slack message format
{
  "channel": "#certify-ci",
  "username": "CertRank CI", 
  "attachments": [{
    "color": "danger|good|warning",
    "title": "Workflow Status",
    "fields": [
      {"title": "Repository", "value": "certrank/platform"},
      {"title": "Triggered by", "value": "@developer"},
      {"title": "Commit", "value": "abc123f"}
    ]
  }]
}
```

### Discord Integration
- Rich embed notifications with color coding
- Role mentions for critical failures
- Clickable links to workflow runs
- Commit and actor information

### Email Notifications
- HTML formatted emails for critical failures
- Automatic escalation for repeated issues
- Team distribution lists
- Mobile-friendly responsive design

### GitHub Issues
- Automatic issue creation for repeated failures
- Standardized templates with debugging info
- Auto-assignment to workflow authors
- Integration with project boards

## Dashboard Integration

### Frontend Component
```tsx
import CIStatusDashboard from './components/CIStatusDashboard';

<CIStatusDashboard 
  repository="certrank/platform"
  className="mb-6"
/>
```

### Real-time Updates
- WebSocket connections for live status
- Auto-refresh every 30 seconds
- Status change animations
- Mobile responsive design

## Customization

### Notification Rules
Edit `.github/ci-notifications.config.json`:

```json
{
  "notifications": {
    "github_issues": {
      "repeated_failure_threshold": 3,
      "time_window_hours": 24,
      "critical_workflows": ["Domain Validation"]
    }
  }
}
```

### Message Templates
Customize notification content in the workflow files:
- `.github/workflows/notify-ci-status.yml`
- Slack webhook payloads
- Discord embed templates
- Email HTML templates

## Monitoring & Metrics

### Key Metrics Tracked
- Build success/failure rates
- Average build duration
- Time to failure detection
- Notification delivery rates

### Prometheus Integration
```yaml
metrics:
  track_build_times: true
  track_failure_rates: true  
  prometheus_endpoint: "https://metrics.certrank.com/prometheus"
```

## Troubleshooting

### Common Issues

**Notifications not received:**
1. Verify webhook URLs in GitHub secrets
2. Check channel permissions (Slack/Discord)
3. Validate JSON configuration syntax
4. Review workflow run logs

**Repeated failure issues not created:**
1. Confirm GitHub permissions for issue creation
2. Check failure threshold configuration
3. Verify workflow name matching

**Dashboard not updating:**
1. Check GitHub API rate limits
2. Verify repository access permissions
3. Review browser console for errors

### Debug Commands
```bash
# Check configuration
./scripts/setup-ci-notifications.sh status

# Test notifications  
./scripts/setup-ci-notifications.sh test

# Validate webhook URLs
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test message"}'
```

## Security Considerations

### Secret Management
- All webhook URLs stored as GitHub secrets
- No sensitive data in configuration files
- Encrypted secret transmission
- Regular secret rotation recommended

### Access Control
- Repository-level secret access
- Webhook URL validation
- Rate limiting on notifications
- Audit logging for all activities

## Future Enhancements

### Planned Features
- [ ] PagerDuty integration for critical alerts
- [ ] Datadog metrics integration
- [ ] Custom notification channels (Teams, etc.)
- [ ] Machine learning failure prediction
- [ ] Advanced notification scheduling
- [ ] Multi-repository dashboard views

### Integration Roadmap
- Status page integration (status.certrank.com)
- Mobile app push notifications  
- Jira ticket creation for failures
- Calendar integration for maintenance windows

## Support

For issues with the notification system:
1. Check the [troubleshooting guide](#troubleshooting)
2. Review workflow logs in GitHub Actions
3. Contact the DevOps team via #certify-devops
4. Create an issue with the `ci` label

---

*Last updated: $(date)*  
*Version: 1.0.0*