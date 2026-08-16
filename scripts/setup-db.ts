import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

// Extract project ref from URL (e.g., "dkypdrocnebusgdlndhn" from "https://dkypdrocnebusgdlndhn.supabase.co")
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

const SQL = `
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no SERIAL,
  full_name TEXT NOT NULL,
  standard VARCHAR(20) NOT NULL,
  date_of_birth VARCHAR(20),
  blood_group VARCHAR(10) DEFAULT '',
  apaar_id VARCHAR(20) DEFAULT '',
  mobile_number VARCHAR(15) DEFAULT '',
  guardian_name TEXT DEFAULT '',
  village TEXT DEFAULT '',
  taluka VARCHAR(50) DEFAULT 'कर्जत',
  district VARCHAR(50) DEFAULT 'रायगड',
  pincode VARCHAR(10) DEFAULT '410201',
  guardian_mobile VARCHAR(15) DEFAULT '',
  guardian_relation VARCHAR(20) DEFAULT 'वडील',
  status VARCHAR(20) DEFAULT 'Enrolled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  designation VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT '',
  mobile_number VARCHAR(15) DEFAULT '',
  email VARCHAR(100) DEFAULT '',
  joining_date VARCHAR(20) DEFAULT '',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_mr VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  username VARCHAR(50),
  ip_address VARCHAR(50),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

interface EndpointConfig {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  name: string;
}

async function tryExecuteSql(endpoint: EndpointConfig): Promise<boolean> {
  try {
    console.log(`Trying endpoint: ${endpoint.name} ...`);
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: endpoint.headers,
      body: JSON.stringify(endpoint.body),
    });

    if (response.ok || response.status === 200 || response.status === 201) {
      console.log(`  Success via ${endpoint.name} (status: ${response.status})`);
      return true;
    }

    const text = await response.text();
    console.log(`  Failed (status: ${response.status}): ${text.slice(0, 200)}`);
    return false;
  } catch (err) {
    console.log(`  Error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function main() {
  console.log('Setting up database schema...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Project ref: ${projectRef}`);
  console.log('');

  const endpoints: EndpointConfig[] = [];

  // If SUPABASE_ACCESS_TOKEN is available, try the Management API first
  if (SUPABASE_ACCESS_TOKEN) {
    endpoints.push({
      name: 'Supabase Management API (database/query)',
      url: `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
      body: { query: SQL },
    });
  }

  // Try REST API endpoints as fallback
  endpoints.push(
    {
      name: 'POST /rest/v1/rpc/exec_sql',
      url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: { sql: SQL },
    },
    {
      name: 'POST /pg/query',
      url: `${SUPABASE_URL}/pg/query`,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: { query: SQL },
    },
  );

  for (const endpoint of endpoints) {
    const success = await tryExecuteSql(endpoint);
    if (success) {
      console.log('\nDatabase schema created successfully!');
      await verifyTables();
      return;
    }
  }

  // Try using supabase-js rpc as final programmatic attempt
  console.log('\nDirect SQL endpoints not available. Trying supabase-js rpc...');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { error: rpcError } = await supabase.rpc('exec', { sql: SQL });
  if (!rpcError) {
    console.log('Success via supabase.rpc("exec")!');
    console.log('\nDatabase schema created successfully!');
    await verifyTables();
    return;
  }
  console.log(`  rpc("exec") failed: ${rpcError.message}`);

  // Check if tables already exist
  console.log('\nAll SQL execution methods failed. Checking if tables already exist...');
  const allExist = await verifyTables();

  if (allExist) {
    console.log('\nAll tables already exist. No action needed.');
    return;
  }

  console.log('\n--- MANUAL SETUP REQUIRED ---');
  console.log('Tables do not exist and could not be created automatically.');
  if (!SUPABASE_ACCESS_TOKEN) {
    console.log('\nTip: Set SUPABASE_ACCESS_TOKEN in .env to use the Supabase Management API.');
    console.log('You can generate a personal access token at: https://supabase.com/dashboard/account/tokens');
  }
  console.log('\nPlease execute the following SQL in the Supabase Dashboard SQL Editor:');
  console.log('(Dashboard > SQL Editor > New Query > paste and run)');
  console.log('');
  console.log(SQL);
}

async function verifyTables(): Promise<boolean> {
  console.log('\nVerifying tables...');
  const tables = ['students', 'staff', 'auth_users', 'security_logs'];
  let allExist = true;

  for (const table of tables) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=count&limit=0`,
        {
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
        }
      );
      if (response.ok) {
        console.log(`  ✓ Table "${table}" exists`);
      } else {
        const text = await response.text();
        console.log(`  ✗ Table "${table}" - status ${response.status}: ${text.slice(0, 100)}`);
        allExist = false;
      }
    } catch (err) {
      console.log(`  ✗ Table "${table}" - error: ${err instanceof Error ? err.message : String(err)}`);
      allExist = false;
    }
  }

  return allExist;
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
