import { OrderItem } from "./OrderItem";

export interface Order {
    id: string;
    items: OrderItem[];
    customer_name: string;
    customer_email: string;
    total_cents: number;
    email_sent_at: string;
    created_at: string;
}