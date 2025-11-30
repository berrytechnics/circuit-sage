// Script to run all database migrations with version tracking
// Usage: node dist/scripts/run-migrations.js

import dotenv from "dotenv";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import pkg from "pg";
const { Pool } = pkg;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "repair_business",
  user: process.env.DB_USER || "repair_admin",
  password: process.env.DB_PASSWORD || "repair_password",
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

/**
 * Calculate checksum for migration file content
 */
function calculateChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Check if migration has already been applied
 */
async function isMigrationApplied(client: any, filename: string): Promise<boolean> {
  try {
    const result = await client.query(
      "SELECT filename FROM schema_migrations WHERE filename = $1",
      [filename]
    );
    return result.rows.length > 0;
  } catch (error: any) {
    // If schema_migrations table doesn't exist yet, return false
    if (error?.code === "42P01") {
      return false;
    }
    throw error;
  }
}

/**
 * Record migration as applied
 */
async function recordMigration(
  client: any,
  filename: string,
  checksum: string,
  executionTimeMs: number
): Promise<void> {
  try {
    await client.query(
      `INSERT INTO schema_migrations (filename, checksum, execution_time_ms)
       VALUES ($1, $2, $3)
       ON CONFLICT (filename) DO NOTHING`,
      [filename, checksum, executionTimeMs]
    );
  } catch (error: any) {
    // If schema_migrations table doesn't exist, that's okay - it will be created by a migration
    if (error?.code === "42P01") {
      console.log("⚠ Migration tracking table not found, will be created by migration");
    } else {
      throw error;
    }
  }
}

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Enable UUID extension first (required for migrations)
    console.log("Enabling UUID extension...");
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log("✓ UUID extension enabled");
    } catch (error) {
      // Extension might already exist or might not be available
      console.log("⚠ UUID extension check:", error instanceof Error ? error.message : String(error));
    }
    
    // Get migration directory (relative to project root or from current location)
    // Try multiple possible locations for migrations
    let migrationsDir = join(__dirname, "../../database/migrations");
    if (!existsSync(migrationsDir)) {
      // Try from backend directory
      migrationsDir = join(__dirname, "../database/migrations");
      if (!existsSync(migrationsDir)) {
        // Try absolute path from app root
        migrationsDir = join(process.cwd(), "database/migrations");
      }
    }
    
    // Get all SQL migration files and sort them
    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    let appliedCount = 0;
    let skippedCount = 0;
    
    // Run each migration
    for (const file of files) {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, "utf-8");
      const checksum = calculateChecksum(sql);
      
      // Check if migration has already been applied
      const alreadyApplied = await isMigrationApplied(client, file);
      
      if (alreadyApplied) {
        console.log(`⚠ Migration ${file} already applied, skipping`);
        skippedCount++;
        continue;
      }
      
      console.log(`Running migration: ${file}`);
      const startTime = Date.now();
      
      try {
        await client.query("BEGIN");
        await client.query(sql);
        
        const executionTime = Date.now() - startTime;
        await recordMigration(client, file, checksum, executionTime);
        await client.query("COMMIT");
        
        console.log(`✓ Migration ${file} completed successfully (${executionTime}ms)`);
        appliedCount++;
      } catch (error: any) {
        await client.query("ROLLBACK");
        
        // Handle idempotent errors - migrations that can be safely skipped if already applied
        const isIdempotentError = 
          (error instanceof Error && error.message.includes("already exists")) ||
          (error?.code === "23505") || // Unique constraint violation (duplicate key)
          (error?.code === "42P07"); // Duplicate table/relation
        
        if (isIdempotentError) {
          console.log(`⚠ Migration ${file} skipped (idempotent error - may already be applied)`);
          // Still record it to prevent future attempts
          const executionTime = Date.now() - startTime;
          await recordMigration(client, file, checksum, executionTime);
          skippedCount++;
        } else {
          console.error(`✗ Migration ${file} failed:`, error);
          throw error;
        }
      }
    }
    
    console.log(`\n✓ Migration summary: ${appliedCount} applied, ${skippedCount} skipped`);
    console.log("✓ All migrations completed successfully");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

