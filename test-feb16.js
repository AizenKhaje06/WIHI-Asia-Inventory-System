// Test script to check Feb 16 transactions
const fetch = require('node-fetch');

async function testFeb16() {
  try {
    // Fetch all transactions
    const response = await fetch('http://localhost:3000/api/reports?startDate=2026-02-16&endDate=2026-02-16');
    const data = await response.json();
    
    console.log('=== FEB 16, 2026 TRANSACTIONS ===');
    console.log('Total Orders:', data.totalOrders);
    console.log('Total Revenue:', data.totalRevenue);
    console.log('Total Cost:', data.totalCost);
    console.log('Total Profit:', data.totalProfit);
    console.log('\nTransactions:');
    
    data.transactions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.itemName} - Qty: ${t.quantity}, Revenue: ₱${t.totalRevenue}, Time: ${t.timestamp}`);
    });
    
    console.log('\n=== DAILY SALES DATA ===');
    console.log(data.dailySales);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFeb16();
