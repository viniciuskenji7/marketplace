import { RegisterProductDTO } from "../dto/product/registerProductDTO";
import { updateProductDTO } from "../dto/product/updateProductDTO";
import type { Product } from "../types/Product";
import { ProductApiResponse } from "../types/ProductApiResponse";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import { api } from "./api";

export const PRODUCTS_PER_PAGE = 5;

function mapProduct(product: ProductApiResponse): Product {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.image_url,
        price: Number(product.price),
        stock: product.stock,
        isActive: product.is_active,
        createdAt: product.created_at,
    };
}

export async function fetchProductPage(
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    search = '',
) {
    const res = await api.get<PaginatedResponse<ProductApiResponse>>('/produtos', {
        params: { page, limit, type: 'physical', ...(search ? { q: search } : {}) },
    });
    return { ...res.data, items: res.data.items.map(mapProduct) };
}

export async function fetchProducts() {
    const firstPage = await fetchProductPage(1, PRODUCTS_PER_PAGE);
    const remainingPages = await Promise.all(
        Array.from(
            { length: Math.max(firstPage.totalPages - 1, 0) },
            (_, index) => fetchProductPage(index + 2, PRODUCTS_PER_PAGE),
        ),
    );
    return [firstPage, ...remainingPages].flatMap((page) => page.items);
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