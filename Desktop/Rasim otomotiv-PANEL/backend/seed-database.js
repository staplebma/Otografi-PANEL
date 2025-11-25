const axios = require('axios');

const BACKEND_URL = 'http://localhost:3007/api';

// Test verileri
const customers = [
  {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '05321234567',
    address: 'Atatürk Caddesi No:123 D:4',
    city: 'İstanbul',
    notes: 'VIP müşteri'
  },
  {
    firstName: 'Mehmet',
    lastName: 'Demir',
    email: 'mehmet.demir@example.com',
    phone: '05339876543',
    address: 'Cumhuriyet Bulvarı No:45',
    city: 'Ankara',
    notes: 'Kurumsal müşteri'
  },
  {
    firstName: 'Ayşe',
    lastName: 'Kaya',
    email: 'ayse.kaya@example.com',
    phone: '05367891234',
    address: 'Gazi Mahallesi Sok No:78',
    city: 'İzmir',
    notes: ''
  },
  {
    firstName: 'Fatma',
    lastName: 'Çelik',
    phone: '05445556677',
    address: 'Yeni Mahalle 12. Sokak',
    city: 'Bursa',
    notes: 'Nakit ödeme tercih ediyor'
  },
  {
    firstName: 'Ali',
    lastName: 'Şahin',
    email: 'ali.sahin@example.com',
    phone: '05556667788',
    address: 'İstiklal Caddesi No:234',
    city: 'Antalya',
    notes: ''
  }
];

const vehicles = [
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: '34ABC123',
    color: 'Beyaz',
    fuelType: 'Benzin',
    transmission: 'Otomatik',
    mileage: 45000,
    lastMaintenanceDate: '2024-10-15',
    nextMaintenanceDate: '2025-10-15',
    maintenanceIntervalDays: 365,
    notes: 'Temiz araç'
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    licensePlate: '06XYZ789',
    color: 'Siyah',
    fuelType: 'Dizel',
    transmission: 'Manuel',
    mileage: 78000,
    lastMaintenanceDate: '2024-09-20',
    nextMaintenanceDate: '2025-09-20',
    maintenanceIntervalDays: 365,
    notes: 'Bakımları düzenli yapılmış'
  },
  {
    brand: 'Renault',
    model: 'Megane',
    year: 2021,
    licensePlate: '35DEF456',
    color: 'Gri',
    fuelType: 'Benzin',
    transmission: 'Otomatik',
    mileage: 32000,
    lastMaintenanceDate: '2024-11-01',
    nextMaintenanceDate: '2025-11-01',
    maintenanceIntervalDays: 365,
    notes: 'Garantili araç'
  },
  {
    brand: 'Ford',
    model: 'Focus',
    year: 2018,
    licensePlate: '16GHI789',
    color: 'Kırmızı',
    fuelType: 'LPG',
    transmission: 'Manuel',
    mileage: 95000,
    lastMaintenanceDate: '2024-08-10',
    nextMaintenanceDate: '2025-08-10',
    maintenanceIntervalDays: 365,
    notes: 'LPG montajı mevcut'
  },
  {
    brand: 'Hyundai',
    model: 'i20',
    year: 2022,
    licensePlate: '07JKL321',
    color: 'Mavi',
    fuelType: 'Hybrid',
    transmission: 'Otomatik',
    mileage: 18000,
    lastMaintenanceDate: '2024-11-20',
    nextMaintenanceDate: '2025-11-20',
    maintenanceIntervalDays: 365,
    notes: 'Hibrit motor'
  }
];

let adminToken = '';
let createdCustomers = [];

async function login() {
  console.log('🔐 Admin olarak giriş yapılıyor...\n');

  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@rasimotomotiv.com',
      password: 'Admin123!'
    });

    adminToken = response.data.access_token;
    console.log('✅ Giriş başarılı!\n');
    return true;
  } catch (error) {
    console.error('❌ Giriş başarısız:', error.response?.data?.message || error.message);
    console.log('\n💡 Önce admin kullanıcı oluşturun: node create-admin.js\n');
    return false;
  }
}

async function createCustomers() {
  console.log('👥 Müşteriler oluşturuluyor...\n');

  for (const customer of customers) {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/customers`,
        customer,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      createdCustomers.push(response.data);
      console.log(`✅ Müşteri oluşturuldu: ${customer.firstName} ${customer.lastName}`);
    } catch (error) {
      console.error(`❌ Müşteri oluşturulamadı (${customer.firstName}):`, error.response?.data?.message || error.message);
    }
  }

  console.log(`\n✅ ${createdCustomers.length} müşteri oluşturuldu!\n`);
}

async function createVehicles() {
  console.log('🚗 Araçlar oluşturuluyor...\n');

  let vehicleCount = 0;

  for (let i = 0; i < vehicles.length && i < createdCustomers.length; i++) {
    const vehicle = { ...vehicles[i] };
    vehicle.customerId = createdCustomers[i].id;

    try {
      await axios.post(
        `${BACKEND_URL}/vehicles`,
        vehicle,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      console.log(`✅ Araç oluşturuldu: ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`);
      vehicleCount++;
    } catch (error) {
      console.error(`❌ Araç oluşturulamadı (${vehicle.licensePlate}):`, error.response?.data?.message || error.message);
    }
  }

  console.log(`\n✅ ${vehicleCount} araç oluşturuldu!\n`);
}

async function createSales() {
  console.log('💰 Satışlar oluşturuluyor...\n');

  const salesData = [
    {
      saleDate: '2024-11-01',
      salePrice: 450000,
      purchasePrice: 400000,
      paymentMethod: 'Nakit',
      status: 'completed',
      notes: 'Peşin ödeme yapıldı'
    },
    {
      saleDate: '2024-11-10',
      salePrice: 380000,
      purchasePrice: 340000,
      paymentMethod: 'Banka Transferi',
      status: 'completed',
      notes: 'Havale ile ödeme'
    },
    {
      saleDate: '2024-11-15',
      salePrice: 520000,
      purchasePrice: 470000,
      paymentMethod: 'Taksit',
      status: 'pending',
      notes: '12 taksit, ilk taksit alındı'
    }
  ];

  let salesCount = 0;

  // İlk 3 müşteriyle araç için satış oluştur
  for (let i = 0; i < salesData.length && i < createdCustomers.length; i++) {
    const sale = { ...salesData[i] };
    sale.customerId = createdCustomers[i].id;

    // Müşterinin araçlarını al
    try {
      const vehiclesResponse = await axios.get(
        `${BACKEND_URL}/vehicles/customer/${createdCustomers[i].id}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (vehiclesResponse.data && vehiclesResponse.data.length > 0) {
        sale.vehicleId = vehiclesResponse.data[0].id;

        const response = await axios.post(
          `${BACKEND_URL}/sales`,
          sale,
          {
            headers: { Authorization: `Bearer ${adminToken}` }
          }
        );

        console.log(`✅ Satış oluşturuldu: ${sale.salePrice}₺ (${sale.status})`);
        salesCount++;
      }
    } catch (error) {
      console.error(`❌ Satış oluşturulamadı:`, error.response?.data?.message || error.message);
    }
  }

  console.log(`\n✅ ${salesCount} satış oluşturuldu!\n`);
}

async function showStats() {
  console.log('📊 Sistem istatistikleri:\n');

  try {
    // Müşteri sayısı
    const customersResponse = await axios.get(
      `${BACKEND_URL}/customers`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    // Araç sayısı
    const vehiclesResponse = await axios.get(
      `${BACKEND_URL}/vehicles`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    // Satış istatistikleri
    const statsResponse = await axios.get(
      `${BACKEND_URL}/sales/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('═══════════════════════════════════════');
    console.log(`👥 Toplam Müşteri: ${customersResponse.data.length}`);
    console.log(`🚗 Toplam Araç: ${vehiclesResponse.data.length}`);
    console.log(`💰 Toplam Satış: ${statsResponse.data.totalSales || 0}`);
    console.log(`📈 Toplam Gelir: ${statsResponse.data.totalRevenue || 0}₺`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ İstatistikler alınamadı:', error.response?.data?.message || error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('   Test Verisi Ekleniyor             ');
  console.log('═══════════════════════════════════════\n');

  const loggedIn = await login();
  if (!loggedIn) return;

  await createCustomers();
  await createVehicles();
  await createSales();
  await showStats();

  console.log('═══════════════════════════════════════');
  console.log('   Tamamlandı! ✅                     ');
  console.log('═══════════════════════════════════════\n');
  console.log('🌐 Frontend: http://localhost:5173');
  console.log('🔧 Backend: http://localhost:3007/api\n');
}

main();
