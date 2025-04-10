import supabase from '../utils/supabase';

export class OrderService {

  async createOrder(orderData, orderItems) {
    try {
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${randomString}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_first_name: orderData.firstName,
            customer_last_name: orderData.lastName,
            customer_email: orderData.email,
            customer_phone: orderData.phone,
            customer_address: orderData.address,
            subtotal: orderData.subtotal,
            discount_amount: orderData.discountAmount,
            total_amount: orderData.totalAmount,
            status: 'pending'
          }
        ])
        .select()
        .single();
      
      if (orderError) throw new Error(`Error creating order: ${orderError.message}`);
      
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        upc: item.upc,
        description: item.description,
        quantity: item.quantity,
        cases: Math.floor(item.quantity / item.case_pack),
        unit_price: item.price,
        discount_percent: item.discount || 0,
        discount_amount: item.discount ? (item.price * (item.discount / 100) * item.quantity) : 0,
        line_total: this.getItemTotal(item)
      }));
      
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select();
      
      if (itemsError) {
        await this.deleteOrder(order.id);
        throw new Error(`Error creating order items: ${itemsError.message}`);
      }
      
      return {
        ...order,
        items
      };
    } catch (error) {
      console.error('OrderService.createOrder error:', error);
      throw error;
    }
  }
  
  async deleteOrder(orderId) {
    await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
  }
  
  getItemTotal(item) {
    if (item.discount && item.discount > 0) {
      const discountAmount = item.price * (item.discount / 100);
      return (item.price - discountAmount) * item.quantity;
    }
    return item.price * item.quantity;
  }
}

export default new OrderService();