export interface Cart {
  items: CartItem[];
  totalCents: number;
}

export interface CartItem {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
  subTotalCents: number;
}

export interface CartItemInput {
  productId: number;
  quantity: number;
}