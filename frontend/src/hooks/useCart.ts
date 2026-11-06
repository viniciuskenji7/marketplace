import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, fetchCart, updateCartItem } from "../services/cart";
import { checkout } from "../services/order";
import { productKey } from "./useProducts";

export const cartKey = 'cart';

export function useCart() {
    return useQuery({
        queryKey: [cartKey],
        queryFn: fetchCart
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addToCart,
        onSuccess: (cart) => queryClient.setQueryData([cartKey], cart)
    })
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCartItem,
        onSuccess: (cart) => queryClient.setQueryData([cartKey], cart)
    });
}

export function useCheckout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkout,
        onSuccess: () => {
            queryClient.setQueryData([cartKey], {items: [], totalCents: 0});
            queryClient.invalidateQueries({queryKey: [cartKey]});
        },
        onError: () => {
            queryClient.invalidateQueries({queryKey: [cartKey]});
            queryClient.invalidateQueries({queryKey: [productKey]});
        }
    })
}