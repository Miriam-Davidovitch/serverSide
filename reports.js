const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// דוח לקוחות
const getCustomersReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers_report_view')
      .select('*');
    
    if (error) throw error;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'לקוחות');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח חובות לקוחות
const getOrdersReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_total_debts_view')
      .select('*');
    
    if (error) throw error;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'חובות לקוחות');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="customer_debts_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח מוצרים
const getProductsReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products_report_view')
      .select('*');
    
    if (error) throw error;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'מוצרים');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="products_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// דוח כספי
const getFinancialReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('financial_report_view')
      .select('*');
    
    if (error) throw error;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'דוח כספי');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="financial_${new Date().toISOString().split('T')[0]}.xlsx"`);
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