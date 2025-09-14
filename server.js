require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { searchCustomer, searchCustomerById, updateWeight, updatePaymentStatus } = require('./getData');
const { getCustomersReport, getOrdersReport, getProductsReport, getFinancialReport } = require('./reports');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-role');
  
  // טיפול בבקשות preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: '🥩 מערכת הזמנות בשר - Server API',
    endpoints: {
      test: '/test',
      searchCustomer: '/api/customer/:searchTerm',
      searchCustomerById: '/api/customer-by-id/:customerId (QR Code)',
      updateWeight: '/api/update-weight (POST)',
      reports: {
        customers: '/api/reports/customers',
        orders: '/api/reports/orders',
        products: '/api/reports/products',
        financial: '/api/reports/financial'
      }
    }
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});


app.get('/api/customer/:searchTerm', (req, res) => {
  searchCustomer(req, res);
});

app.get('/api/customer-by-id/:customerId', (req, res) => {
  searchCustomerById(req, res);
});

app.post('/api/update-weight', (req, res) => {
  updateWeight(req, res);
});

app.post('/api/update-payment', (req, res) => {
  updatePaymentStatus(req, res);
});

// נתיבי דוחות
app.get('/api/reports/customers', getCustomersReport);
app.get('/api/reports/orders', getOrdersReport);
app.get('/api/reports/products', getProductsReport);
app.get('/api/reports/financial', getFinancialReport);

// For Vercel deployment
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🥩 מערכת מכירת בשר פועלת על http://localhost:${PORT}`);
    console.log('🔍 חיפוש לקוח: /api/customer/:searchTerm');
    console.log('⚖️ עדכון משקל: /api/update-weight');
    console.log('📊 דוחות:');
    console.log('  👥 לקוחות: /api/reports/customers');
    console.log('  📋 הזמנות: /api/reports/orders');
    console.log('  🥩 מוצרים: /api/reports/products');
    console.log('  💰 כספי: /api/reports/financial');
    console.log('🧪 בדיקה: /test');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'מוגדר' : 'חסר');
  });
}