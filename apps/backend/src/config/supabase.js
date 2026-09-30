const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const primaryKey = serviceRoleKey || anonKey;

if (!supabaseUrl || !primaryKey) {
  console.warn(
    '[WARN] Supabase credentials are missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY in .env'
  );
}

// Master / Backend Service Client
const supabase = createClient(supabaseUrl, primaryKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin client specifically using Service Role Key
const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

// Scoped client for authenticated users (respects RLS)
const getAuthClient = (jwtToken) => {
  return createClient(supabaseUrl, anonKey || primaryKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
};

module.exports = {
  supabase,
  supabaseAdmin,
  getAuthClient,
};
