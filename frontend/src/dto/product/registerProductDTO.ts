

export interface RegisterProductDTO {
    name: string;
    description: string;
    price: number;
    stock: number;
    isActive: number;
    imageUrl: string;
    scene?: "ceramic" | "linen" | "stone" | "honey";
}