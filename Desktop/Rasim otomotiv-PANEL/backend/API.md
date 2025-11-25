# Rasim Otomotiv CRM API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "jwt_token_here"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

---

## Customers

### Get All Customers
```http
GET /customers
Authorization: Bearer {token}
```

### Search Customers
```http
GET /customers/search?q=search_term
Authorization: Bearer {token}
```

### Get Customer by ID
```http
GET /customers/:id
Authorization: Bearer {token}
```

### Create Customer
```http
POST /customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Ali",
  "lastName": "Yılmaz",
  "email": "ali@example.com",
  "phone": "+905551234567",
  "address": "İstanbul Caddesi No: 123",
  "city": "İstanbul",
  "notes": "VIP müşteri"
}
```

### Update Customer
```http
PATCH /customers/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "+905559876543"
}
```

### Delete Customer (Admin Only)
```http
DELETE /customers/:id
Authorization: Bearer {token}
```

---

## Vehicles

### Get All Vehicles
```http
GET /vehicles
Authorization: Bearer {token}
```

### Get Maintenance Due Vehicles
```http
GET /vehicles/maintenance-due
Authorization: Bearer {token}
```

### Get Vehicles by Customer
```http
GET /vehicles/customer/:customerId
Authorization: Bearer {token}
```

### Get Vehicle by ID
```http
GET /vehicles/:id
Authorization: Bearer {token}
```

### Create Vehicle
```http
POST /vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "licensePlate": "34ABC123",
  "vin": "VIN123456789",
  "color": "Beyaz",
  "fuelType": "Benzin",
  "transmission": "Otomatik",
  "mileage": 50000,
  "lastMaintenanceDate": "2024-01-15",
  "nextMaintenanceDate": "2025-01-15",
  "maintenanceIntervalDays": 365,
  "notes": "Yeni araç"
}
```

### Update Vehicle
```http
PATCH /vehicles/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "mileage": 55000,
  "lastMaintenanceDate": "2024-06-15"
}
```

### Update Maintenance Status
```http
PATCH /vehicles/:id/maintenance-status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "warning"
}
```

### Delete Vehicle (Admin Only)
```http
DELETE /vehicles/:id
Authorization: Bearer {token}
```

---

## Sales

### Get All Sales
```http
GET /sales
Authorization: Bearer {token}
```

**Note**: Regular users only see their own sales. Admins and managers see all sales.

### Get Sales Statistics
```http
GET /sales/stats
Authorization: Bearer {token}
```

Response:
```json
{
  "totalSales": 150,
  "completedSales": 120,
  "pendingSales": 30,
  "totalRevenue": 2500000,
  "totalProfit": 500000
}
```

### Get Sale by ID
```http
GET /sales/:id
Authorization: Bearer {token}
```

### Create Sale
```http
POST /sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "vehicleId": "uuid",
  "saleDate": "2024-11-23",
  "salePrice": 250000,
  "purchasePrice": 200000,
  "paymentMethod": "Kredi Kartı",
  "status": "completed",
  "notes": "İlk satış"
}
```

### Update Sale
```http
PATCH /sales/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "notes": "Ödeme tamamlandı"
}
```

### Delete Sale (Admin Only)
```http
DELETE /sales/:id
Authorization: Bearer {token}
```

---

## Notifications

### Get All Notifications
```http
GET /notifications
Authorization: Bearer {token}
```

### Get Unread Notifications
```http
GET /notifications/unread
Authorization: Bearer {token}
```

### Mark Notification as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
PATCH /notifications/read-all
Authorization: Bearer {token}
```

### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer {token}
```

---

## Enums

### Payment Methods
- `Nakit`
- `Kredi Kartı`
- `Banka Transferi`
- `Taksit`

### Sale Status
- `pending`
- `completed`
- `cancelled`

### Fuel Types
- `Benzin`
- `Dizel`
- `LPG`
- `Elektrik`
- `Hybrid`

### Transmission Types
- `Manuel`
- `Otomatik`

### Maintenance Status
- `ok` - More than 60 days
- `warning` - Between 6-60 days
- `critical` - 5 days or less / overdue

### User Roles
- `admin` - Full access
- `manager` - Can view all data, limited delete permissions
- `user` - Standard employee access

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
