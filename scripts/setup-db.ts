import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

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
  body: unknown;
  name: string;
}

async function tryExecuteSql(endpoint: EndpointConfig): Promise<boolean> {
  try {
    console.log(`Trying endpoint: ${endpoint.name} ...`);
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(endpoint.body),
    });

    if (response.ok || response.status === 200 || response.status === 204) {
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
  console.log('');

  // Try multiple known Supabase SQL execution endpoints
  const endpoints: EndpointConfig[] = [
    {
      name: 'POST /rest/v1/rpc/exec_sql',
      url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      body: { sql: SQL },
    },
    {
      name: 'POST /pg/query',
      url: `${SUPABASE_URL}/pg/query`,
      body: { query: SQL },
    },
    {
      name: 'POST /query',
      url: `${SUPABASE_URL}/query`,
      body: { query: SQL },
    },
  ];

  for (const endpoint of endpoints) {
    const success = await tryExecuteSql(endpoint);
    if (success) {
      console.log('\nDatabase schema created successfully!');
      await verifyTables();
      return;
    }
  }

  // If none of the SQL endpoints worked, try using supabase-js rpc
  console.log('\nDirect SQL endpoints not available. Trying supabase-js rpc...');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Try calling exec function if it exists
  const { error: rpcError } = await supabase.rpc('exec', { sql: SQL });
  if (!rpcError) {
    console.log('Success via supabase.rpc("exec")!');
    console.log('\nDatabase schema created successfully!');
    await verifyTables();
    return;
  }
  console.log(`  rpc("exec") failed: ${rpcError.message}`);

  // Final fallback: verify if tables already exist
  console.log('\nAll SQL execution methods failed. Checking if tables already exist...');
  await verifyTables();

  console.log('\n--- MANUAL SETUP REQUIRED ---');
  console.log('If tables do not exist, please execute the following SQL');
  console.log('in the Supabase Dashboard SQL Editor:');
  console.log('');
  console.log(SQL);
}

async function verifyTables() {
  console.log('\nVerifying tables...');
  const tables = ['students', 'staff', 'auth_users', 'security_logs'];

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
      }
    } catch (err) {
      console.log(`  ✗ Table "${table}" - error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
