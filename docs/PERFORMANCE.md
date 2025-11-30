# Performance Optimization Guide

This guide covers database performance optimization, query optimization, and caching strategies for RepairForge.

## Database Indexes

### Current Index Coverage

RepairForge has comprehensive index coverage across all major tables:

#### Core Tables
- **Users**: `company_id`, `email` (unique)
- **Customers**: `company_id`, `email`, `phone`, `name` (composite)
- **Tickets**: `company_id`, `customer_id`, `technician_id`, `status`, `location_id`, `asset_id`
- **Invoices**: `company_id`, `customer_id`, `ticket_id`, `status`, `location_id`
- **Inventory Items**: `company_id`, `category`, `brand_model` (composite), `is_active`, `location_id`

#### Multi-Tenancy Indexes
All tenant tables have `company_id` indexes for efficient tenant isolation.

#### Relationship Indexes
Foreign key relationships are indexed for join performance.

### Index Verification

To verify indexes are present:

```sql
-- List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Recommended Additional Indexes

Consider adding these indexes based on query patterns:

```sql
-- Composite index for common ticket queries
CREATE INDEX IF NOT EXISTS idx_tickets_company_status_created 
ON tickets(company_id, status, created_at DESC);

-- Composite index for invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_status_due 
ON invoices(company_id, status, due_date) 
WHERE status != 'paid';

-- Index for soft-deleted records (if frequently queried)
CREATE INDEX IF NOT EXISTS idx_customers_not_deleted 
ON customers(company_id) 
WHERE deleted_at IS NULL;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_tickets_created_at 
ON tickets(created_at DESC);
```

## Query Optimization

### Best Practices

1. **Use Indexed Columns in WHERE Clauses**
   ```typescript
   // Good: Uses company_id index
   db.selectFrom("tickets")
     .where("company_id", "=", companyId)
     .where("status", "=", "open")
   
   // Avoid: Full table scan
   db.selectFrom("tickets")
     .where("notes", "like", "%search%")
   ```

2. **Limit Result Sets**
   ```typescript
   // Always use limit for list queries
   db.selectFrom("tickets")
     .where("company_id", "=", companyId)
     .limit(50)
     .offset(page * 50)
   ```

3. **Use Select Specific Columns**
   ```typescript
   // Good: Select only needed columns
   db.selectFrom("customers")
     .select(["id", "first_name", "last_name", "email"])
   
   // Avoid: Select all columns
   db.selectFrom("customers")
     .selectAll()
   ```

4. **Avoid N+1 Queries**
   ```typescript
   // Good: Use joins or batch queries
   const tickets = await db
     .selectFrom("tickets")
     .innerJoin("customers", "customers.id", "tickets.customer_id")
     .select(["tickets.*", "customers.first_name", "customers.last_name"])
     .where("tickets.company_id", "=", companyId)
     .execute();
   
   // Avoid: Querying in a loop
   for (const ticket of tickets) {
     const customer = await db
       .selectFrom("customers")
       .where("id", "=", ticket.customer_id)
       .executeTakeFirst();
   }
   ```

### Slow Query Detection

Enable slow query logging in PostgreSQL:

```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Reload configuration
SELECT pg_reload_conf();
```

### Query Analysis

Use EXPLAIN ANALYZE to understand query performance:

```sql
EXPLAIN ANALYZE
SELECT * FROM tickets 
WHERE company_id = 'xxx' 
AND status = 'open'
ORDER BY created_at DESC
LIMIT 50;
```

Look for:
- **Seq Scan**: Full table scan (bad)
- **Index Scan**: Using index (good)
- **Index Only Scan**: Best case
- **Nested Loop**: May be slow for large datasets

## Caching Strategies

### Application-Level Caching

#### 1. In-Memory Caching (Node.js)

For frequently accessed, rarely changing data:

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// Cache permissions
async function getPermissions(role: string, companyId: string) {
  const cacheKey = `permissions:${role}:${companyId}`;
  let permissions = cache.get<string[]>(cacheKey);
  
  if (!permissions) {
    permissions = await fetchPermissionsFromDB(role, companyId);
    cache.set(cacheKey, permissions);
  }
  
  return permissions;
}
```

#### 2. Redis Caching (Recommended for Production)

For distributed caching:

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function getCachedData(key: string) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchFromDatabase();
  await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
  return data;
}
```

### Cache Invalidation

Implement cache invalidation strategies:

```typescript
// Invalidate on update
async function updateCustomer(id: string, data: UpdateCustomerDto) {
  await db.updateTable("customers").set(data).where("id", "=", id).execute();
  
  // Invalidate cache
  await redis.del(`customer:${id}`);
  await redis.del(`customers:list:${companyId}`);
}
```

### Caching Recommendations

**Cache These:**
- Role permissions (rarely change)
- Company settings
- Location lists
- Diagnostic checklist templates

**Don't Cache:**
- User-specific data (frequently changing)
- Real-time data (tickets, invoices)
- Transactional data

## Connection Pooling

### Current Configuration

Connection pool is configured in `backend/src/config/connection.ts`:

```typescript
pool: new Pool({
  max: process.env.NODE_ENV === "test" ? 20 : 10,
  idleTimeoutMillis: process.env.NODE_ENV === "test" ? 1000 : 30000,
  connectionTimeoutMillis: process.env.NODE_ENV === "test" ? 5000 : 2000,
})
```

### Production Recommendations

Adjust based on load:

```typescript
pool: new Pool({
  max: 20, // Increase for high traffic
  min: 5, // Keep minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Enable statement timeout
  statement_timeout: 30000, // 30 seconds
})
```

## Database Maintenance

### Vacuum and Analyze

Run regularly to maintain performance:

```sql
-- Analyze tables (update statistics)
ANALYZE;

-- Vacuum tables (reclaim space)
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE tickets;
```

### Auto-Vacuum Configuration

PostgreSQL auto-vacuum is enabled by default. Monitor:

```sql
SELECT 
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

## Performance Monitoring

### Key Metrics

Monitor these database metrics:

1. **Query Performance**
   - Average query time
   - Slow queries (>1 second)
   - Query throughput

2. **Connection Pool**
   - Active connections
   - Idle connections
   - Connection wait time

3. **Index Usage**
   - Index hit ratio (should be >95%)
   - Unused indexes
   - Missing indexes

4. **Table Size**
   - Table sizes
   - Index sizes
   - Bloat percentage

### Monitoring Queries

```sql
-- Index hit ratio
SELECT 
  sum(idx_blks_read) as index_reads,
  sum(idx_blks_hit) as index_hits,
  (sum(idx_blks_hit) - sum(idx_blks_read)) / sum(idx_blks_hit) as ratio
FROM pg_statio_user_indexes;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Connection stats
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
WHERE datname = current_database();
```

## Load Testing

### Tools

- **Apache Bench (ab)**: Simple load testing
- **k6**: Modern load testing tool
- **Artillery**: Node.js load testing
- **JMeter**: Comprehensive testing tool

### Example Load Test

```bash
# Test API endpoint with 100 requests, 10 concurrent
ab -n 100 -c 10 https://api.example.com/api/tickets

# Using k6
k6 run --vus 10 --duration 30s load-test.js
```

### Load Test Script (k6)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.example.com/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Performance Checklist

### Pre-Production

- [ ] Verify all indexes are created
- [ ] Run ANALYZE on all tables
- [ ] Test query performance with EXPLAIN ANALYZE
- [ ] Configure connection pool appropriately
- [ ] Set up slow query logging
- [ ] Implement caching for static data

### Production Monitoring

- [ ] Monitor query performance
- [ ] Track index usage
- [ ] Monitor connection pool usage
- [ ] Set up alerts for slow queries
- [ ] Regular VACUUM ANALYZE
- [ ] Review and optimize slow queries

### Ongoing Optimization

- [ ] Weekly review of slow queries
- [ ] Monthly index usage analysis
- [ ] Quarterly performance review
- [ ] Adjust caching strategies based on usage
- [ ] Scale database resources as needed

## Additional Resources

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Kysely Query Builder](https://kysely.dev/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)



