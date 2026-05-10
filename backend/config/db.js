const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'traveloop',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT DEFAULT '',
        city TEXT DEFAULT '',
        country TEXT DEFAULT '',
        additional_info TEXT DEFAULT '',
        password TEXT NOT NULL,
        profile_photo TEXT DEFAULT 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trips (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        country TEXT DEFAULT '',
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ,
        cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
        is_public BOOLEAN DEFAULT FALSE,
        share_id TEXT UNIQUE,
        sections JSONB DEFAULT '[]'::jsonb,
        cities JSONB DEFAULT '[]'::jsonb,
        packing_checklist JSONB DEFAULT '[]'::jsonb,
        notes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name TEXT NOT NULL,
        author_photo TEXT DEFAULT '',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'Trip',
        country TEXT DEFAULT '',
        region TEXT DEFAULT '',
        related_name TEXT DEFAULT '',
        rating INTEGER DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log(`Postgres connected: ${process.env.PGDATABASE || 'traveloop'}`);
  } catch (error) {
    console.error(`Postgres error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
