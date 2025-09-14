const XLSX = require('xlsx');

// דוח לקוחות - דוח ריק לניסיון
const getCustomersReport = async (req, res) => {
  try {
    // נתונים דמו לניסיון - לא קריאה ל-API
    const demoData = [
      { 'שם לקוח': 'דוגמה', 'טלפון': '050-0000000', 'מייל': 'demo@example.com', 'הערה': 'דוח ניסיון - לא נתונים אמיתיים' }
    ];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'לקוחות');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="customers_demo_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח הזמנות - דוח ריק לניסיון
const getOrdersReport = async (req, res) => {
  try {
    const demoData = [
      { 'מספר הזמנה': '123', 'לקוח': 'דוגמה', 'תאריך': '2024-01-01', 'סכום': '0', 'הערה': 'דוח ניסיון - לא נתונים אמיתיים' }
    ];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'הזמנות');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="orders_demo_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח מוצרים - דוח ריק לניסיון
const getProductsReport = async (req, res) => {
  try {
    const demoData = [
      { 'שם מוצר': 'דוגמה', 'משקל ממוצע': '1.0', 'מחיר לקילו': '100', 'הערה': 'דוח ניסיון - לא נתונים אמיתיים' }
    ];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'מוצרים');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="products_demo_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח כספי - דוח ריק לניסיון
const getFinancialReport = async (req, res) => {
  try {
    const demoData = [
      { 'סוג': 'דוגמה', 'סכום': '0', 'מטבע': 'שקל', 'הערה': 'דוח ניסיון - לא נתונים אמיתיים' }
    ];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'דוח כספי');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="financial_demo_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCustomersReport,
  getOrdersReport,
  getProductsReport,
  getFinancialReport
};