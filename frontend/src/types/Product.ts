export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: number;
  imageUrl: string;
  createdAt: string;
  scene?: "ceramic" | "linen" | "stone" | "honey";
}