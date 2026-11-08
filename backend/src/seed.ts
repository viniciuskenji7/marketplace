import { AppDataSource } from './data-source.js';
import { Product } from './product/entities/product.entity.js';

const products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Caneca de Cerâmica',
    description: 'Caneca resistente para café ou chá.',
    image_url: 'https://placehold.co/600x400?text=Caneca',
    price: 39.9,
    stock: 0,
    is_active: 1,
  },
  {
    name: 'Camiseta Básica',
    description: 'Camiseta confortável para o dia a dia.',
    image_url: 'https://placehold.co/600x400?text=Camiseta',
    price: 59.9,
    stock: 120,
    is_active: 1,
  },
  {
    name: 'Boné de Lã',
    description: 'Boné macio para os dias mais frios.',
    image_url: 'https://placehold.co/600x400?text=Bone',
    price: 45,
    stock: 3,
    is_active: 1,
  },
  {
    name: 'Garrafa Térmica',
    description: 'Garrafa reutilizável para bebidas quentes ou frias.',
    image_url: 'https://placehold.co/600x400?text=Garrafa',
    price: 89.9,
    stock: 48,
    is_active: 1,
  },
  {
    name: 'Mochila Urbana',
    description: 'Mochila espaçosa para trabalho, estudo ou viagens.',
    image_url: 'https://placehold.co/600x400?text=Mochila',
    price: 149.9,
    stock: 5,
    is_active: 1,
  },
  {
    name: 'Caderno Pontilhado',
    description: 'Caderno para anotações, planejamento e desenhos.',
    image_url: 'https://placehold.co/600x400?text=Caderno',
    price: 34.9,
    stock: 75,
    is_active: 1,
  },
  {
    name: 'Fone de Ouvido',
    description: 'Fone leve para música e chamadas.',
    image_url: 'https://placehold.co/600x400?text=Fone',
    price: 119.9,
    stock: 0,
    is_active: 1,
  },
  {
    name: 'Luminária de Mesa',
    description: 'Luminária compacta para sua mesa de estudos.',
    image_url: 'https://placehold.co/600x400?text=Luminaria',
    price: 79.9,
    stock: 32,
    is_active: 1,
  },
  {
    name: 'Ecobag Reutilizável',
    description: 'Sacola resistente para compras e uso diário.',
    image_url: 'https://placehold.co/600x400?text=Ecobag',
    price: 24.9,
    stock: 100,
    is_active: 1,
  },
  {
    name: 'Mousepad Estendido',
    description: 'Mousepad amplo com superfície confortável.',
    image_url: 'https://placehold.co/600x400?text=Mousepad',
    price: 49.9,
    stock: 60,
    is_active: 1,
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const repository = AppDataSource.getRepository(Product);
    const existingProducts = await repository.count();

    if (existingProducts > 0) {
      console.log(
        `Seed ignorada: já existem ${existingProducts} produtos cadastrados.`,
      );
      return;
    }

    await repository.save(repository.create(products));
    console.log(`Seed concluída: ${products.length} produtos inseridos.`);
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error(
    'Falha ao executar a seed:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
