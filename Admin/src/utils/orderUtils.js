// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status color class
  export const getStatusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        };
    }
  };
  
  // Export orders to CSV
  export const exportOrdersToCSV = (orders) => {
    if (!orders || orders.length === 0) {
      return null;
    }
    
    // Define CSV headers
    const headers = [
      'Order Number',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'Subtotal',
      'Discount',
      'Total',
      'Status',
      'Date'
    ];
    
    // Convert orders to CSV rows
    const csvData = orders.map(order => [
      order.order_number,
      `${order.customer_first_name} ${order.customer_last_name}`,
      order.customer_email,
      order.customer_phone,
      order.customer_address,
      order.subtotal,
      order.discount_amount,
      order.total_amount,
      order.status,
      new Date(order.created_at).toLocaleString()
    ]);
    
    // Add headers to the beginning
    csvData.unshift(headers);
    
    // Convert to CSV string
    const csvContent = csvData
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export a single order with items to CSV
  export const exportOrderDetailToCSV = (order) => {
    if (!order) {
      return null;
    }
    
    // Create CSV content for order header
    let csvContent = `"Order Information"\n`;
    csvContent += `"Order Number","${order.order_number}"\n`;
    csvContent += `"Customer","${order.customer_first_name} ${order.customer_last_name}"\n`;
    csvContent += `"Email","${order.customer_email}"\n`;
    csvContent += `"Phone","${order.customer_phone}"\n`;
    csvContent += `"Address","${order.customer_address}"\n`;
    csvContent += `"Status","${order.status}"\n`;
    csvContent += `"Date","${new Date(order.created_at).toLocaleString()}"\n\n`;
    
    // Add order items
    csvContent += `"Order Items"\n`;
    csvContent += `"UPC","Description","Quantity","Cases","Unit Price","Discount %","Discount Amount","Line Total"\n`;
    
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        csvContent += [
          `"${item.upc}"`,
          `"${item.description}"`,
          `"${item.quantity}"`,
          `"${item.cases}"`,
          `"${item.unit_price}"`,
          `"${item.discount_percent || 0}"`,
          `"${item.discount_amount}"`,
          `"${item.line_total}"`
        ].join(',') + '\n';
      });
    }
    
    // Add order totals
    csvContent += `\n"Order Totals"\n`;
    csvContent += `"Subtotal","${order.subtotal}"\n`;
    csvContent += `"Discount","${order.discount_amount}"\n`;
    csvContent += `"Total","${order.total_amount}"\n`;
    
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `order-${order.order_number}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };