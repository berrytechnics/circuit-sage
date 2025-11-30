# Monitoring and Observability Guide

This guide covers monitoring, logging, and error tracking setup for CircuitSage in production.

## Overview

Effective monitoring is essential for production deployments. This guide covers:
- Application monitoring
- Error tracking
- Log aggregation
- Performance monitoring
- Alerting

## Monitoring Stack Options

### Option 1: Sentry (Recommended)

Sentry provides comprehensive error tracking and performance monitoring.

**Features:**
- Real-time error tracking
- Performance monitoring
- Release tracking
- User context
- Source maps support

### Option 2: DataDog

Enterprise-grade monitoring solution.

**Features:**
- APM (Application Performance Monitoring)
- Log management
- Infrastructure monitoring
- Custom dashboards

### Option 3: Rollbar

Lightweight error tracking.

**Features:**
- Error tracking
- Deploy tracking
- Custom data

### Option 4: Self-Hosted (ELK Stack)

For full control over monitoring infrastructure.

**Components:**
- Elasticsearch (search and analytics)
- Logstash (log processing)
- Kibana (visualization)

## Sentry Integration

### Backend Setup

1. **Install Sentry SDK**:
```bash
cd backend
yarn add @sentry/node @sentry/profiling-node
```

2. **Initialize Sentry** in `backend/src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});
```

3. **Add Error Handler** in `backend/src/app.ts`:
```typescript
import * as Sentry from "@sentry/node";

// Error handling middleware
app.use((err: Error | HttpError, req: Request, res: Response, _next: NextFunction) => {
  Sentry.captureException(err);
  // ... existing error handling
});
```

4. **Add Environment Variable**:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Frontend Setup

1. **Install Sentry SDK**:
```bash
cd frontend
yarn add @sentry/nextjs
```

2. **Initialize Sentry** - Create `frontend/sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

3. **Create** `frontend/sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

4. **Update** `frontend/next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    // ... existing config
  },
  {
    silent: true,
    org: "your-org",
    project: "circuit-sage",
  }
);
```

5. **Add Environment Variable**:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Log Aggregation

### Winston Configuration

CircuitSage uses Winston for logging. Current configuration:

- **Development**: Console + file logging
- **Production**: Console logging only (configure for your platform)

### Production Logging Setup

#### Render.com

Render automatically captures stdout/stderr logs. Access via:
- Dashboard → Service → Logs

#### CloudWatch (AWS)

1. Install CloudWatch agent
2. Configure log streams
3. View logs in CloudWatch console

#### Google Cloud Logging

1. Use Cloud Logging client library
2. Logs automatically captured
3. View in Cloud Console

### Structured Logging

Winston is configured for structured JSON logging:

```typescript
logger.info("User logged in", {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});
```

## Health Checks

### Application Health Endpoint

CircuitSage includes a health check endpoint:

```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Enhanced Health Check

Consider adding database connectivity check:

```typescript
app.get("/health", async (req: Request, res: Response) => {
  const dbHealthy = await testConnection();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "ok" : "unhealthy",
    database: dbHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});
```

### Monitoring Health Checks

Set up external monitoring:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusCake**: Monitoring and alerts

## Performance Monitoring

### Key Metrics to Monitor

1. **Response Times**
   - API endpoint response times
   - Database query times
   - Frontend page load times

2. **Error Rates**
   - 4xx errors (client errors)
   - 5xx errors (server errors)
   - Error trends over time

3. **Throughput**
   - Requests per second
   - Database connections
   - Concurrent users

4. **Resource Usage**
   - CPU usage
   - Memory usage
   - Database size
   - Disk usage

### APM Tools

- **Sentry Performance**: Built into Sentry
- **New Relic**: Comprehensive APM
- **Datadog APM**: Full-stack monitoring
- **AppDynamics**: Enterprise APM

## Alerting

### Critical Alerts

Set up alerts for:

1. **Application Down**
   - Health check fails
   - Service unavailable

2. **High Error Rate**
   - Error rate > 5% of requests
   - Spike in 5xx errors

3. **Database Issues**
   - Connection failures
   - Slow queries
   - High connection count

4. **Resource Exhaustion**
   - High CPU usage (>80%)
   - High memory usage (>90%)
   - Disk space low (<10%)

### Alert Channels

- **Email**: Basic alerting
- **Slack**: Team notifications
- **PagerDuty**: On-call management
- **SMS**: Critical alerts

### Alert Configuration Example

```yaml
# Example alert rules (for Prometheus/Grafana)
alerts:
  - name: HighErrorRate
    condition: error_rate > 0.05
    duration: 5m
    severity: critical
    channels: [slack, email]
  
  - name: DatabaseDown
    condition: db_connection_failures > 0
    duration: 1m
    severity: critical
    channels: [slack, pagerduty]
```

## Dashboard Setup

### Key Dashboards

1. **Application Overview**
   - Request rate
   - Error rate
   - Response times
   - Active users

2. **Database Performance**
   - Query performance
   - Connection pool usage
   - Slow queries
   - Database size

3. **Infrastructure**
   - CPU/Memory usage
   - Network traffic
   - Disk usage
   - Container health

### Dashboard Tools

- **Grafana**: Open-source dashboards
- **Datadog**: Built-in dashboards
- **New Relic**: Pre-built dashboards
- **CloudWatch**: AWS-native dashboards

## Log Retention

### Recommended Retention

- **Application Logs**: 30 days
- **Error Logs**: 90 days
- **Access Logs**: 7 days
- **Audit Logs**: 1 year

### Log Rotation

Configure log rotation to prevent disk fill:

```bash
# Example logrotate config
/path/to/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

## Monitoring Best Practices

### 1. Start Simple

Begin with basic monitoring:
- Health checks
- Error tracking
- Basic metrics

### 2. Add Gradually

Add more sophisticated monitoring as needed:
- Performance monitoring
- Custom metrics
- Advanced alerting

### 3. Monitor What Matters

Focus on:
- User-facing metrics
- Business-critical operations
- Cost-related metrics

### 4. Set Appropriate Thresholds

- Avoid alert fatigue
- Set thresholds based on baseline
- Review and adjust regularly

### 5. Regular Reviews

- Weekly: Review error trends
- Monthly: Review performance metrics
- Quarterly: Review monitoring strategy

## Troubleshooting

### Logs Not Appearing

**Check:**
- Log level configuration
- Log file permissions
- Disk space availability
- Log aggregation service status

### Alerts Not Firing

**Check:**
- Alert configuration
- Threshold values
- Notification channel setup
- Alert service status

### High Alert Volume

**Solutions:**
- Adjust thresholds
- Group related alerts
- Use alert suppression
- Review alert rules

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)



