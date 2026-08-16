import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { students, staff } from '../src/data/mockData.js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BATCH_SIZE = 50;

async function checkTablesExist(): Promise<boolean> {
  const { error } = await supabase.from('students').select('id').limit(0);
  if (error) {
    if (error.message.includes('Could not find') || error.code === 'PGRST205') {
      return false;
    }
    // Table exists but some other error - treat as existing
  }
  return true;
}

async function clearExistingData(): Promise<void> {
  console.log('Clearing existing data...');

  const { error: e1 } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) console.log(`  Warning clearing students: ${e1.message}`);

  const { error: e2 } = await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) console.log(`  Warning clearing staff: ${e2.message}`);

  const { error: e3 } = await supabase.from('auth_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) console.log(`  Warning clearing auth_users: ${e3.message}`);

  console.log('  Done clearing existing data.');
}

async function seedStudents(): Promise<number> {
  console.log(`\nSeeding ${students.length} students...`);

  // Map from mockData format to DB format (remove id field, let DB auto-generate UUID)
  const dbStudents = students.map(({ id: _id, ...rest }) => rest);

  let inserted = 0;
  for (let i = 0; i < dbStudents.length; i += BATCH_SIZE) {
    const batch = dbStudents.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('students').insert(batch);
    if (error) {
      console.error(`  Error inserting students batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      continue;
    }
    inserted += batch.length;
    console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(dbStudents.length / BATCH_SIZE)} (${inserted} total)`);
  }

  return inserted;
}

async function seedStaff(): Promise<number> {
  console.log(`\nSeeding ${staff.length} staff members...`);

  // Map from mockData Staff format to DB format
  // Remove: id, designation_marathi, role (not in DB schema)
  const dbStaff = staff.map(({ id: _id, designation_marathi: _dm, role: _role, ...rest }) => ({
    ...rest,
    status: 'Active',
  }));

  const { error } = await supabase.from('staff').insert(dbStaff);
  if (error) {
    console.error(`  Error inserting staff: ${error.message}`);
    return 0;
  }

  console.log(`  Inserted ${dbStaff.length} staff members.`);
  return dbStaff.length;
}

async function seedAuthUsers(): Promise<number> {
  console.log('\nSeeding auth_users...');

  // TODO: Replace plaintext passwords with bcrypt hashes in production
  const authUsers = [
    { username: 'admin', password_hash: 'Admin@2024', role: 'web_creator', name_en: 'Super Admin', name_mr: 'सुपर अॅडमिन' },
    { username: 'principal', password_hash: 'Principal@2024', role: 'principal', name_en: 'Principal', name_mr: 'मुख्याध्यापक' },
    { username: 'teacher', password_hash: 'Teacher@2024', role: 'class_teacher', name_en: 'Class Teacher', name_mr: 'वर्गशिक्षक' },
    { username: 'clerk', password_hash: 'Clerk@2024', role: 'clerk', name_en: 'Clerk', name_mr: 'लिपिक' },
    { username: 'sports', password_hash: 'Sports@2024', role: 'subject_teacher', name_en: 'Subject Teacher', name_mr: 'विषय शिक्षक' },
    { username: 'parent', password_hash: 'Parent@2024', role: 'student_parent', name_en: 'Student/Parent', name_mr: 'विद्यार्थी/पालक' },
  ];

  const { error } = await supabase.from('auth_users').insert(authUsers);
  if (error) {
    console.error(`  Error inserting auth_users: ${error.message}`);
    return 0;
  }

  console.log(`  Inserted ${authUsers.length} auth users.`);
  return authUsers.length;
}

async function verifyCounts(): Promise<void> {
  console.log('\nVerifying inserted data...');

  const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
  const { count: authCount } = await supabase.from('auth_users').select('*', { count: 'exact', head: true });

  console.log(`  Seeded ${studentCount ?? 0} students, ${staffCount ?? 0} staff, ${authCount ?? 0} auth_users`);
}

async function main() {
  console.log('=== Database Seed Script ===');
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  // Step 1: Check if tables exist
  const tablesExist = await checkTablesExist();
  if (!tablesExist) {
    console.error('ERROR: Tables do not exist in the database.');
    console.error('Please create the tables first by running the SQL in the Supabase Dashboard SQL Editor.');
    console.error('You can get the SQL by running: npx tsx scripts/setup-db.ts');
    process.exit(1);
  }

  // Step 2: Clear existing data (makes script idempotent)
  await clearExistingData();

  // Step 3: Seed students
  const studentCount = await seedStudents();

  // Step 4: Seed staff
  const staffCount = await seedStaff();

  // Step 5: Seed auth users
  const authUserCount = await seedAuthUsers();

  // Step 6: Verify
  await verifyCounts();

  console.log('\n=== Seed Complete ===');
  console.log(`Summary: ${studentCount} students, ${staffCount} staff, ${authUserCount} auth_users inserted.`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
