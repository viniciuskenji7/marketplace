
export interface CartItemView {
  productId: number;
  sessionId?: number;
  type: 'physical' | 'workshop';
  name: string;
  unitPriceCents: number;
  quantity: number;
  subTotalCents: number;
  startsAt?: Date;
  durationMinutes?: number;
  location?: string;
}

export interface CartView {
  items: CartItemView[];
  totalCents: number;
}