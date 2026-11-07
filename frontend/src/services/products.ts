import { RegisterProductDTO } from "../dto/product/registerProductDTO";
import type { Product } from "../types/Product";
import { api } from "./api";

export async function fetchProducts() {
    const res = await api.get<Product[]>('/produtos');
    return res.data;
}

export async function registerProduct(product: RegisterProductDTO) {
    const res = await api.post<RegisterProductDTO>('/produtos', product);
    return res.data;
}