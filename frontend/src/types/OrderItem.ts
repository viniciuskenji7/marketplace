import { Order } from "./Order";
import { Product } from "./Product";

export interface OrderItem {
    id: number;
    order: Order;
    product: Product;
    product_name: string;
    unit_price_cents: number
    quantity: number;
    subtotal_cents: number;
}