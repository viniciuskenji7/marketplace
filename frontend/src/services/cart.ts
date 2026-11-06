import { Cart, CartItemInput } from "../types/Cart";
import { api } from "./api";

export const fetchCart = () => 
    api.get<Cart>('/carrinho').then((res) => res.data);

export const addToCart = (item: CartItemInput) => 
    api.post<Cart>('/carrinho', item).then((res) => res.data);

export const updateCartItem = (item: CartItemInput) => 
    api.put<Cart>('/carrinho', item).then((res) => res.data);

