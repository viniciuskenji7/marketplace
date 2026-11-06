import { Product } from "../types/Product";



export async function fetchProducts() {
    const res = await fetch('/products');
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    return res.json(); 
}

export async function registerProduct(product: Product) {
    const res = await fetch(`/products`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Erro ao cadastrar produto');
    return res.json();
}