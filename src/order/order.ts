export interface Order {
  id: number;
  customer_id: number;
  status: string;
  total_amount: number;
  created_at: Date;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}