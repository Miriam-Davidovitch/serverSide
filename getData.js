const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// חיפוש לקוח לפי טלפון/מייל/מספר הזמנה
const searchCustomer = async (req, res) => {
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const searchTerm = req.params.searchTerm;
  const isAdmin = req.query.admin === 'true';
  
  try {
    // חיפוש לקוח לפי טלפון, מייל או תעודת זהות
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .or(`phone.eq.${searchTerm},email.eq.${searchTerm},customerid.eq.${searchTerm}`)
      .single();
    
    // אם לא נמצא לפי טלפון/מייל, ננסה לפי מספר הזמנה - רק למנהלים
    if (customerError && !isNaN(searchTerm) && isAdmin) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('customerid')
        .eq('orderid', parseInt(searchTerm))
        .single();
      
      if (!orderError && orderData) {
        const { data: customerByOrder, error: customerByOrderError } = await supabase
          .from('customers')
          .select('*')
          .eq('customerid', orderData.customerid)
          .single();
        
        if (!customerByOrderError) {
          customer = customerByOrder;
        }
      }
    }
    
    if (!customer) {
      return res.status(404).json({ error: 'לא נמצא לקוח' });
    }
    
    // שליפת הזמנות ומוצרים
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        orderid,
        orderdate,
        orderproducts (
          orderproductid,
          finalweight,
          paidprice,
          didnt_get,
          products (
            productname,
            avgweight,
            priceperkg
          )
        )
      `)
      .eq('customerid', customer.customerid)
      .order('orderdate', { ascending: false });
    
    if (ordersError) {
      return res.status(500).json({ error: 'שגיאה בשליפת הזמנות' });
    }
    
    // עיצוב הנתונים
    const formattedOrders = orders.map(order => ({
      orderid: order.orderid,
      orderdate: order.orderdate,
      products: order.orderproducts.map(op => ({
        orderproductid: op.orderproductid,
        productname: op.products.productname,
        avgweight: op.products.avgweight,
        priceperkg: op.products.priceperkg,
        finalweight: op.finalweight,
        paidprice: op.paidprice,
        notreceived: op.didnt_get
      }))
    }));
    
    res.json({
      customer,
      orders: formattedOrders
    });
    
  } catch (err) {
    console.error('שגיאה בחיפוש לקוח:', err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// עדכון משקל סופי וסטטוס לא קבלתי - תומך בעדכונים מרובים
const updateWeight = async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const { updates, customerId, paymentStatus, orderProductId, finalWeight, notReceived } = req.body;
  
  try {
    // אם זה עדכון מרובה (החדש)
    if (updates && Array.isArray(updates)) {
      // עדכון כל המוצרים
      const updatePromises = updates.map(update => 
        supabase
          .from('orderproducts')
          .update({ 
            finalweight: update.finalWeight,
            didnt_get: update.notReceived || false,
            updatedat: new Date().toISOString()
          })
          .eq('orderproductid', update.orderProductId)
      );
      
      const results = await Promise.all(updatePromises);
      
      // בדיקה שכל העדכונים הצליחו
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        return res.status(500).json({ error: 'שגיאה בעדכון חלק מהמוצרים' });
      }
      
      // עדכון סטטוס תשלום אם נדרש
      if (customerId && paymentStatus !== undefined) {
        const { error: paymentError } = await supabase
          .from('customers')
          .update({ 'שילמתי': paymentStatus })
          .eq('customerid', customerId);
        
        if (paymentError) {
          return res.status(500).json({ error: 'שגיאה בעדכון סטטוס תשלום' });
        }
      }
      
      res.json({ message: 'כל הנתונים עודכנו בהצלחה' });
      
    } else {
      // עדכון יחיד (תאימות לאחור)
      if (!orderProductId || !finalWeight) {
        return res.status(400).json({ error: 'חסרים פרמטרים' });
      }
      
      const { data, error } = await supabase
        .from('orderproducts')
        .update({ 
          finalweight: finalWeight,
          didnt_get: notReceived || false,
          updatedat: new Date().toISOString()
        })
        .eq('orderproductid', orderProductId)
        .select();
      
      if (error) {
        return res.status(500).json({ error: 'שגיאה בעדכון: ' + error.message });
      }
      
      res.json({ message: 'נתונים עודכנו בהצלחה', data });
    }
    
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת: ' + err.message });
  }
};

// חיפוש לקוח לפי Customer ID (עבור QR Code)
const searchCustomerById = async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const customerId = req.params.customerId;
  console.log('חיפוש לקוח לפי ID:', customerId);
  
  try {
    // חיפוש לקוח לפי Customer ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('customerid', parseInt(customerId))
      
      .single();
    
    if (customerError || !customer) {
      return res.status(404).json({ error: 'לא נמצא לקוח' });
    }
    
    // שליפת הזמנות ומוצרים
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        orderid,
        orderdate,
        orderproducts (
          orderproductid,
          finalweight,
          paidprice,
          didnt_get,
          products (
            productname,
            avgweight,
            priceperkg
          )
        )
      `)
      .eq('customerid', customer.customerid)
      .order('orderdate', { ascending: false });
    
    if (ordersError) {
      return res.status(500).json({ error: 'שגיאה בשליפת הזמנות' });
    }
    
    // עיצוב הנתונים
    const formattedOrders = orders.map(order => ({
      orderid: order.orderid,
      orderdate: order.orderdate,
      products: order.orderproducts.map(op => ({
        orderproductid: op.orderproductid,
        productname: op.products.productname,
        avgweight: op.products.avgweight,
        priceperkg: op.products.priceperkg,
        finalweight: op.finalweight,
        paidprice: op.paidprice,
        notreceived: op.didnt_get
      }))
    }));
    
    res.json({
      customer,
      orders: formattedOrders
    });
    
  } catch (err) {
    console.error('שגיאה בחיפוש לקוח:', err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// עדכון סטטוס תשלום
const updatePaymentStatus = async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const { customerId, paid } = req.body;
  
  console.log('עדכון תשלום:', { customerId, paid });
  
  if (!customerId) {
    return res.status(400).json({ error: 'חסר מספר לקוח' });
  }
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        'שילמתי': paid || false
      })
      .eq('customerid', customerId)
      .select();
    
    console.log('תוצאת עדכון:', { data, error });
    
    if (error) {
      console.error('שגיאת Supabase:', error);
      return res.status(500).json({ error: 'שגיאה בעדכון: ' + error.message });
    }
    
    res.json({ message: 'סטטוס תשלום עודכן בהצלחה', data });
    
  } catch (err) {
    console.error('שגיאת שרת:', err);
    res.status(500).json({ error: 'שגיאת שרת: ' + err.message });
  }
};

module.exports = { searchCustomer, searchCustomerById, updateWeight, updatePaymentStatus };