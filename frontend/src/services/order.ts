import { CheckoutInput, CheckoutResult } from "../types/Checkout";
import { api } from "./api";

export const checkout = (item: CheckoutInput) => 
    api.post<CheckoutResult>('/finalizar-compra', item).then((res) => res.data);