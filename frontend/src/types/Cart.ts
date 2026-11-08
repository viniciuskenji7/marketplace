export interface Cart {
  items: CartItem[];
  totalCents: number;
}

export interface CartItem {
  productId: number;
  sessionId?: number;
  type: 'physical' | 'workshop';
  name: string;
  unitPriceCents: number;
  quantity: number;
  subTotalCents: number;
  startsAt?: string;
  durationMinutes?: number;
  location?: string;
}

export interface CartItemInput {
  productId: number;
  sessionId?: number;
  quantity: number;
}