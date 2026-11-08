
export interface ProductApiResponse {
    id: number;
    name: string;
    description: string;
    image_url: string;
    price: number | string;
    stock: number;
    is_active: number;
    created_at: string;
}