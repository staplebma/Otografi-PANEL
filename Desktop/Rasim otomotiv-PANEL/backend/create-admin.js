const axios = require('axios');

const BACKEND_URL = 'http://localhost:3007/api';

async function createAdminUser() {
  console.log('🚀 Admin kullanıcı oluşturuluyor...\n');

  const adminData = {
    email: 'admin@rasimotomotiv.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  try {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, adminData);

    console.log('✅ Admin kullanıcı başarıyla oluşturuldu!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Şifre:', adminData.password);
    console.log('👤 Rol:', adminData.role);
    console.log('\n🎉 Artık giriş yapabilirsiniz: http://localhost:5173\n');

  } catch (error) {
    if (error.response) {
      console.error('❌ Hata:', error.response.data.message || error.response.data);

      if (error.response.status === 409) {
        console.log('\n💡 Bu email zaten kayıtlı. Mevcut bilgilerle giriş yapabilirsiniz:');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Şifre:', adminData.password);
      }
    } else {
      console.error('❌ Beklenmeyen hata:', error.message);
      console.log('\n💡 Backend çalışıyor mu? Kontrol edin: ' + BACKEND_URL);
    }
  }
}

async function createTestUsers() {
  console.log('\n🔧 Test kullanıcıları oluşturuluyor...\n');

  const testUsers = [
    {
      email: 'manager@rasimotomotiv.com',
      password: 'Manager123!',
      firstName: 'Mehmet',
      lastName: 'Yönetici',
      role: 'manager'
    },
    {
      email: 'user@rasimotomotiv.com',
      password: 'User123!',
      firstName: 'Ahmet',
      lastName: 'Satıcı',
      role: 'user'
    }
  ];

  for (const user of testUsers) {
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, user);
      console.log(`✅ ${user.role} kullanıcı oluşturuldu: ${user.email}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`ℹ️  ${user.email} zaten mevcut`);
      } else {
        console.error(`❌ ${user.email} oluşturulamadı:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n✅ Tüm kullanıcılar hazır!\n');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('   Rasim Otomotiv CRM - Kurulum       ');
  console.log('═══════════════════════════════════════\n');

  await createAdminUser();

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Test kullanıcıları da oluşturulsun mu? (e/h): ', async (answer) => {
    if (answer.toLowerCase() === 'e') {
      await createTestUsers();
    }

    console.log('\n═══════════════════════════════════════');
    console.log('   Kurulum tamamlandı!                ');
    console.log('═══════════════════════════════════════\n');

    readline.close();
  });
}

main();
