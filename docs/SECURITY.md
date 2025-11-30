# Security Guide

This document outlines security measures implemented in RepairForge and best practices for production deployment.

## Security Features

### Authentication & Authorization

- **JWT Authentication**: All API endpoints (except `/health`, `/auth/login`, `/auth/register`) require a valid JWT token
- **Access Tokens**: Short-lived (1 hour) access tokens for API requests
- **Refresh Tokens**: Long-lived (7 days) refresh tokens for obtaining new access tokens
- **Role-Based Access Control (RBAC)**: Granular permissions system with roles (admin, manager, technician, frontdesk)
- **Multi-Tenant Isolation**: Company-level data isolation ensures users can only access their company's data

### Rate Limiting

Rate limiting is implemented to prevent brute force attacks and DoS:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: 5 requests per 15 minutes per IP (login/register)
- **Sensitive Operations**: 3 requests per hour per IP (password reset, etc.)

### Data Protection

- **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
- **API Key Encryption**: Third-party API keys are encrypted at rest using AES-256-GCM
- **SQL Injection Prevention**: Using Kysely query builder with parameterized queries
- **XSS Prevention**: Helmet.js middleware configured with security headers

### CORS Configuration

- **Development**: All origins allowed for easier development
- **Production**: Only configured origins allowed (set via `ALLOWED_ORIGINS` environment variable)

## Production Security Checklist

### Before Deployment

- [ ] **Remove Default Credentials**
  - Run `yarn ts-node backend/scripts/remove-default-admin.ts`
  - Or manually delete/update default admin users
  - Default credentials: `admin@repairforge.com` / `admin123`

- [ ] **Set Strong Environment Variables**
  - `JWT_SECRET`: Use a strong, random secret (minimum 32 characters)
  - `ENCRYPTION_KEY`: Use a strong encryption key (exactly 32 characters for AES-256)
  - `ALLOWED_ORIGINS`: Set to your production frontend URL(s), comma-separated

- [ ] **Enable HTTPS/SSL**
  - Configure SSL certificates (Let's Encrypt recommended)
  - Force HTTPS redirects
  - Set secure cookie flags

- [ ] **Review CORS Settings**
  - Set `ALLOWED_ORIGINS` environment variable
  - Remove wildcard origins in production

- [ ] **Database Security**
  - Use strong database passwords
  - Restrict database access to application servers only
  - Enable SSL for database connections if supported

- [ ] **Review Rate Limits**
  - Adjust rate limits based on expected traffic
  - Monitor for false positives

### Environment Variables

Required security-related environment variables:

```bash
# JWT Secret - Generate a strong random string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Encryption Key - Exactly 32 characters for AES-256-GCM
ENCRYPTION_KEY=your-32-character-encryption-key

# CORS Origins (production only) - Comma-separated list
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Node Environment
NODE_ENV=production
```

### Generating Secure Secrets

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Encryption Key (exactly 32 characters)
openssl rand -hex 16
```

## Security Best Practices

### Password Policy

- Minimum 8 characters (enforced)
- Consider implementing stronger policies (uppercase, lowercase, numbers, special characters)
- Encourage users to use password managers

### Token Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens are invalidated on logout (client-side)
- Consider implementing token blacklisting for immediate revocation

### API Security

- All API endpoints require authentication (except public endpoints)
- Rate limiting prevents abuse
- Input validation on all endpoints
- Error messages don't expose sensitive information

### Data Encryption

- Passwords: Hashed with bcrypt (never stored in plain text)
- API Keys: Encrypted at rest using AES-256-GCM
- Database: Consider enabling encryption at rest (PostgreSQL)

### Monitoring & Logging

- Monitor failed login attempts
- Log security events (rate limit violations, authentication failures)
- Set up alerts for suspicious activity
- Regular security audits

## Common Security Issues

### Default Credentials

**Issue**: Default admin credentials (`admin@repairforge.com` / `admin123`) are a security risk.

**Solution**: 
1. Run the removal script: `yarn ts-node backend/scripts/remove-default-admin.ts`
2. Or manually delete/update default admin users before production deployment

### Rate Limiting False Positives

**Issue**: Legitimate users may hit rate limits.

**Solution**: 
- Adjust rate limits in `backend/src/middlewares/rate-limit.middleware.ts`
- Consider implementing user-based rate limiting (not just IP-based)
- Monitor rate limit violations and adjust accordingly

### CORS Misconfiguration

**Issue**: Allowing all origins in production.

**Solution**: 
- Set `ALLOWED_ORIGINS` environment variable
- Review CORS configuration in `backend/src/app.ts`
- Test CORS with production URLs

### Weak Secrets

**Issue**: Using default or weak secrets.

**Solution**: 
- Generate strong, random secrets for `JWT_SECRET` and `ENCRYPTION_KEY`
- Use different secrets for development and production
- Rotate secrets periodically

## Incident Response

If a security incident occurs:

1. **Immediately**: Revoke affected tokens/credentials
2. **Assess**: Determine scope of the breach
3. **Contain**: Isolate affected systems
4. **Notify**: Inform affected users if data was compromised
5. **Remediate**: Fix the vulnerability
6. **Document**: Record the incident and lessons learned

## Security Updates

- Keep dependencies up to date (`yarn audit`)
- Monitor security advisories for used packages
- Apply security patches promptly
- Regular security audits

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [your-security-email]
3. Include details about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)



