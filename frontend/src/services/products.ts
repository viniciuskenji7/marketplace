import { RegisterProductDTO } from "../dto/product/registerProductDTO";
import { updateProductDTO } from "../dto/product/updateProductDTO";
import type { Product } from "../types/Product";
import { ProductApiResponse } from "../types/ProductApiResponse";
import { api } from "./api";


function mapProduct(product: ProductApiResponse): Product {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.image_url,
        price: Number(product.price),
        stock: product.stock,
        isActive: product.is_active,
    };
}

export async function fetchProducts() {
    const res = await api.get<ProductApiResponse[]>('/produtos');
    return res.data.map(mapProduct);
}

export async function registerProduct(product: RegisterProductDTO) {
    const res = await api.post<ProductApiResponse>('/produtos', product);
    return mapProduct(res.data);
}

export async function updateProduct(product: updateProductDTO, id: number) {
    const res = await api.put<ProductApiResponse>(`/produtos/${id}`, product);
    return mapProduct(res.data);
}

export async function deleteProduct(id: number) {
    const res = await api.delete<ProductApiResponse>(`/produtos/${id}`);
    return mapProduct(res.data);
}