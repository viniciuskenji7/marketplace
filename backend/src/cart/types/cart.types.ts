
export interface CartItemView {
  productId: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
  subTotalCents: number;
}

export interface CartView {
  items: CartItemView[];
  totalCents: number;
}