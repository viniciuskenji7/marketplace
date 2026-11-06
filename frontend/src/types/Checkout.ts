import { CartItem } from "./Cart";

export interface CheckoutInput {
  name: string;
  email: string;
}

export interface CheckoutResult {
  orderId: string;
  items: CartItem[];
  totalCents: number;
  emailSent: boolean;
}