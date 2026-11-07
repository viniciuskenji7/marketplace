import type { Product } from "../types/Product";

export const products: Product[] = [
  {
    id: 1,
    name: "Caneca de cerâmica",
    description: "Feita à mão, esmalte areia. 350 ml.",
    price: 69,
    stock: 12,
    isActive: 1,
    imageUrl: "",
    scene: "ceramic",
  },
  {
    id: 2,
    name: "Ecobag de linho",
    description: "Linho cru resistente, alças longas.",
    price: 89.9,
    stock: 8,
    isActive: 1,
    imageUrl: "",
    scene: "linen",
  },
  {
    id: 3,
    name: "Vaso Pedra",
    description: "Cimento queimado, ideal para suculentas.",
    price: 54.9,
    stock: 15,
    isActive: 1,
    imageUrl: "",
    scene: "stone",
  },
  {
    id: 4,
    name: "Café de origem",
    description: "Torra artesanal, notas de chocolate e mel.",
    price: 38,
    stock: 20,
    isActive: 1,
    imageUrl: "",
    scene: "honey",
  },
];
