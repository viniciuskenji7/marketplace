import { CheckoutInput } from "../types/Checkout";
import { api } from "./api";



export const checkout = (item: CheckoutInput) => 
    api.post<CheckoutInput>('/finalizar-compra', item).then((res) => res.data);