// Script to run all database migrations
// Usage: node dist/scripts/run-migrations.js

import dotenv from "dotenv";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
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
    
    // Run each migration
    for (const file of files) {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, "utf-8");
      
      console.log(`Running migration: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✓ Migration ${file} completed successfully`);
      } catch (error) {
        // If it's a "relation already exists" error, that's okay (idempotent)
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`⚠ Migration ${file} skipped (already applied)`);
        } else {
          console.error(`✗ Migration ${file} failed:`, error);
          throw error;
        }
      }
    }
    
    console.log("\n✓ All migrations completed successfully");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

