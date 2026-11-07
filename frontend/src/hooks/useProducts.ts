import { useQuery } from "@tanstack/react-query";
import { Product } from "../types/Product";
import { fetchProducts } from "../services/products";


export const productKey = 'products';

export function useProducts() { 
    return useQuery<Product[]>({
        queryKey: [productKey],
        queryFn: fetchProducts
    })
}