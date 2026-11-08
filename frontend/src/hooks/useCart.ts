import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, fetchCart, updateCartItem } from "../services/cart";
import { checkout } from "../services/order";
import { productKey } from "./useProducts";
import type { Cart, CartItem, CartItemInput } from "../types/Cart";
import type { Product } from "../types/Product";
import type { Workshop } from "../types/Workshop";

export const cartKey = 'cart';

type AddToCartVariables = CartItemInput & {
    optimisticProduct?: Product;
    optimisticWorkshop?: Workshop;
};

type CartMutationContext = {
    previousCart: Cart | undefined;
};

function createCart(items: CartItem[]): Cart {
    return {
        items,
        totalCents: items.reduce((total, item) => total + item.subTotalCents, 0),
    };
}

export function useCart() {
    return useQuery<Cart>({
        queryKey: [cartKey],
        queryFn: fetchCart
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation<Cart, Error, AddToCartVariables, CartMutationContext>({
        mutationFn: ({ productId, sessionId, quantity }) =>
            addToCart({ productId, sessionId, quantity }),
        onMutate: async ({
            productId,
            sessionId,
            quantity,
            optimisticProduct,
            optimisticWorkshop,
        }) => {
            await queryClient.cancelQueries({ queryKey: [cartKey] });

            const previousCart = queryClient.getQueryData<Cart>([cartKey]);
            if (!previousCart) return { previousCart };

            const existingItem = previousCart.items.find(
                (item) => item.productId === productId && item.sessionId === sessionId,
            );
            let optimisticItem: CartItem | undefined;

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                optimisticItem = {
                    ...existingItem,
                    quantity: newQuantity,
                    subTotalCents: existingItem.unitPriceCents * newQuantity,
                };
            } else if (sessionId === undefined) {
                const product =
                    optimisticProduct ??
                    queryClient
                        .getQueryData<Product[]>([productKey])
                        ?.find((item) => item.id === productId && item.isActive === 1);

                if (product) {
                    const unitPriceCents = Math.round(product.price * 100);
                    optimisticItem = {
                        productId,
                        type: 'physical',
                        name: product.name,
                        unitPriceCents,
                        quantity,
                        subTotalCents: unitPriceCents * quantity,
                    };
                }
            }

            if (!optimisticItem && optimisticWorkshop && sessionId !== undefined) {
                const session = optimisticWorkshop.sessions.find(
                    (item) => item.id === sessionId,
                );
                if (session) {
                    const unitPriceCents = Math.round(optimisticWorkshop.price * 100);
                    optimisticItem = {
                        productId,
                        sessionId,
                        type: 'workshop',
                        name: optimisticWorkshop.name,
                        unitPriceCents,
                        quantity,
                        subTotalCents: unitPriceCents * quantity,
                        startsAt: session.startsAt,
                        durationMinutes: session.durationMinutes,
                        location: optimisticWorkshop.location,
                    };
                }
            }

            if (optimisticItem) {
                const items = existingItem
                    ? previousCart.items.map((item) =>
                          item.productId === productId && item.sessionId === sessionId
                              ? optimisticItem!
                              : item,
                      )
                    : [...previousCart.items, optimisticItem];
                queryClient.setQueryData([cartKey], createCart(items));
            }

            return { previousCart };
        },
        onSuccess: (cart) => queryClient.setQueryData([cartKey], cart),
        onError: (_error, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData([cartKey], context.previousCart);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [cartKey] }),
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    return useMutation<Cart, Error, CartItemInput, CartMutationContext>({
        mutationFn: updateCartItem,
        onMutate: async ({ productId, sessionId, quantity }) => {
            await queryClient.cancelQueries({ queryKey: [cartKey] });

            const previousCart = queryClient.getQueryData<Cart>([cartKey]);
            if (!previousCart) return { previousCart };

            const items =
                quantity === 0
                    ? previousCart.items.filter(
                      (item) =>
                          item.productId !== productId ||
                          item.sessionId !== sessionId,
                  )
                : previousCart.items.map((item) =>
                      item.productId === productId && item.sessionId === sessionId
                            ? {
                            ...item,
                            quantity,
                            subTotalCents: item.unitPriceCents * quantity,
                            }
                            : item,
                      );

            queryClient.setQueryData([cartKey], createCart(items));
            return { previousCart };
        },
        onSuccess: (cart) => queryClient.setQueryData([cartKey], cart),
        onError: (_error, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData([cartKey], context.previousCart);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [cartKey] }),
    });
}

export function useCheckout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkout,
        onSuccess: () => {
            queryClient.setQueryData([cartKey], {items: [], totalCents: 0});
            queryClient.invalidateQueries({queryKey: [cartKey]});
            queryClient.invalidateQueries({queryKey: [productKey]});
            queryClient.invalidateQueries({queryKey: ['workshops']});
        },
        onError: () => {
            queryClient.invalidateQueries({queryKey: [cartKey]});
            queryClient.invalidateQueries({queryKey: [productKey]});
            queryClient.invalidateQueries({queryKey: ['workshops']});
        }
    })
}