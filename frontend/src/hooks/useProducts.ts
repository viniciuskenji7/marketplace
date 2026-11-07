import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { updateProductDTO } from "../dto/product/updateProductDTO";
import type { Product } from "../types/Product";
import {
    deleteProduct,
    fetchProducts,
    registerProduct,
    updateProduct,
} from "../services/products";


export const productKey = 'products';

export function useProducts() { 
    return useQuery<Product[]>({
        queryKey: [productKey],
        queryFn: fetchProducts
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: registerProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, product }: { id: number; product: updateProductDTO }) =>
            updateProduct(product, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}