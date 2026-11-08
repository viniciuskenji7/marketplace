import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { updateProductDTO } from "../dto/product/updateProductDTO";
import type { Product } from "../types/Product";
import {
    deleteProduct,
    fetchProducts,
    registerProduct,
    updateProduct,
} from "../services/products";
import type { RegisterProductDTO } from "../dto/product/registerProductDTO";
import { fetchProductPage } from "../services/products";
import type { PaginatedResponse } from "../types/PaginatedResponse";

export const productKey = 'products';

type UpdateProductVariables = {
  id: number;
  product: updateProductDTO;
};

type UpdateProductContext = {
  previousProducts: Product[] | undefined;
};

type CreateProductContext = {
  optimisticId: number;
  previousProducts: Product[] | undefined;
};

let nextOptimisticProductId = -1;

export function useProducts() { 
    return useQuery<Product[]>({
        queryKey: [productKey],
        queryFn: fetchProducts
    })
}

export function useProductCatalog(page: number, limit = 12, search = '') {
    return useQuery<PaginatedResponse<Product>>({
        queryKey: [productKey, 'catalog', page, limit, search],
        queryFn: () => fetchProductPage(page, limit, search),
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation<Product, Error, RegisterProductDTO, CreateProductContext>({
        mutationFn: registerProduct,
        onMutate: async (newProduct) => {
            await queryClient.cancelQueries({ queryKey: [productKey] });

            const previousProducts = queryClient.getQueryData<Product[]>([productKey]);
            const optimisticId = nextOptimisticProductId--;
            const optimisticProduct: Product = {
                id: optimisticId,
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                stock: newProduct.stock,
                isActive: 1,
                imageUrl: newProduct.image_url,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Product[]>([productKey], (products) => [
                ...(products ?? []),
                optimisticProduct,
            ]);

            return { optimisticId, previousProducts };
        },
        onSuccess: (createdProduct, variables, context) => {
            queryClient.setQueryData<Product[]>([productKey], (products) =>
                products?.map((product) =>
                    product.id === context.optimisticId
                        ? createdProduct
                        : product,
                ),
            );
        },
        onError: (error, variables, context) => {
            if (!context) return;
            queryClient.setQueryData<Product[]>([productKey], context.previousProducts);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation<Product, Error, UpdateProductVariables, UpdateProductContext>({
        mutationFn: ({ id, product }: { id: number; product: updateProductDTO }) =>
            updateProduct(product, id),

        onMutate: async ({ id, product: changes }) => {
            await queryClient.cancelQueries({ queryKey: [productKey] });

            const previousProducts = queryClient.getQueryData<Product[]>([productKey]);
            
            queryClient.setQueryData<Product[]>([productKey], (products) =>
                products?.map((currentProduct) =>
                    currentProduct.id === id
                        ? {
                              ...currentProduct,
                              name: changes.name ?? currentProduct.name,
                              description:
                                  changes.description ?? currentProduct.description,
                              price: changes.price ?? currentProduct.price,
                              stock: changes.stock ?? currentProduct.stock,
                              imageUrl:
                                  changes.image_url ?? currentProduct.imageUrl,
                          }
                        : currentProduct,
                ),
            );

            return { previousProducts };
        },
        onError: (error, variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData([productKey], context.previousProducts);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation<Product, Error, number, { previousProducts: Product[] | undefined }>({
        mutationFn: deleteProduct,
        onMutate: async (productId) => {
            // Trava os refetchs da pagina
            await queryClient.cancelQueries({ queryKey: [productKey] });
            // guarda uma lista tipada de produtos anteriores. Caso tudo de errado, voltaremos pra ca
            const previousProducts = queryClient.getQueryData<Product[]>([productKey]);
            // Faz a exclusão otimista
            queryClient.setQueryData<Product[]>([productKey], (products) =>
                products?.map((product) =>
                    product.id === productId
                        ? { ...product, isActive: 0 }
                        : product,
                ),
            );
            // retorna a lista para ser usada posteriormente
            return { previousProducts };
        },
        onError: (error, productId, mutationContext) => {
            // se der erro, verifica a lista antiga e utiliza ela
            if (mutationContext?.previousProducts) {
                queryClient.setQueryData(
                    [productKey],
                    mutationContext.previousProducts,
                );
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [productKey] }),
    });
}