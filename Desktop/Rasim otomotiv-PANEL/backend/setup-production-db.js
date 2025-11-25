#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Run this after deploying to production to initialize the database
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Rasim Otomotiv Panel - Production Database Setup\n');
  console.log('This script will:');
  console.log('1. Verify database connection');
  console.log('2. Create your admin account');
  console.log('3. Optionally seed test data\n');

  // Get Supabase credentials
  const supabaseUrl = await question('Enter SUPABASE_URL: ');
  const supabaseKey = await question('Enter SUPABASE_SERVICE_ROLE_KEY: ');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required credentials!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  console.log('\n📡 Testing database connection...');
  const { data: testData, error: testError } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (testError) {
    console.error('❌ Database connection failed:', testError.message);
    console.log('\n💡 Make sure you have run the schema SQL in Supabase Dashboard!');
    process.exit(1);
  }

  console.log('✅ Database connection successful!\n');

  // Create admin user
  console.log('👤 Creating Admin Account\n');

  const adminEmail = await question('Admin Email: ');
  const adminPassword = await question('Admin Password (min 6 chars): ');
  const adminFirstName = await question('Admin First Name: ');
  const adminLastName = await question('Admin Last Name: ');

  if (!adminEmail || !adminPassword || adminPassword.length < 6) {
    console.error('❌ Invalid admin credentials!');
    process.exit(1);
  }

  // Check if admin already exists
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('email', adminEmail)
    .single();

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!');
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        password: hashedPassword,
        first_name: adminFirstName,
        last_name: adminLastName,
        role: 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Failed to create admin:', adminError.message);
      process.exit(1);
    }

    console.log('✅ Admin account created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);
  }

  // Ask about test data
  const seedData = await question('Create test data? (yes/no): ');

  if (seedData.toLowerCase() === 'yes' || seedData.toLowerCase() === 'y') {
    console.log('\n📊 Creating test data...');

    // Create test customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert([
        {
          first_name: 'Ahmet',
          last_name: 'Yılmaz',
          email: 'ahmet@example.com',
          phone: '+90 532 123 4567',
          address: 'Atatürk Cad. No:15 Kadıköy/İstanbul',
        },
        {
          first_name: 'Mehmet',
          last_name: 'Demir',
          email: 'mehmet@example.com',
          phone: '+90 533 234 5678',
          address: 'Cumhuriyet Mah. Bağdat Cad. No:25 Kartal/İstanbul',
        },
        {
          first_name: 'Ayşe',
          last_name: 'Kaya',
          email: 'ayse@example.com',
          phone: '+90 534 345 6789',
          address: 'Ataşehir Bulvarı No:42 Ataşehir/İstanbul',
        },
      ])
      .select();

    if (customersError) {
      console.error('⚠️  Warning: Could not create test customers:', customersError.message);
    } else {
      console.log(`✅ Created ${customers.length} test customers`);

      // Create test vehicles
      if (customers && customers.length > 0) {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .insert([
            {
              customer_id: customers[0].id,
              plate: '34 ABC 123',
              brand: 'BMW',
              model: '320i',
              year: 2020,
              vin: 'WBA12345678901234',
            },
            {
              customer_id: customers[1].id,
              plate: '06 XYZ 456',
              brand: 'Mercedes',
              model: 'C200',
              year: 2019,
              vin: 'WDD12345678901234',
            },
            {
              customer_id: customers[2].id,
              plate: '35 DEF 789',
              brand: 'Audi',
              model: 'A4',
              year: 2021,
              vin: 'WAU12345678901234',
            },
          ])
          .select();

        if (vehiclesError) {
          console.error('⚠️  Warning: Could not create test vehicles:', vehiclesError.message);
        } else {
          console.log(`✅ Created ${vehicles.length} test vehicles`);
        }
      }
    }

    console.log('\n✅ Test data created successfully!');
  }

  console.log('\n🎉 Production database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Login with your admin credentials');
  console.log('2. Configure your domain settings');
  console.log('3. Start managing your business!\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
