import { AppDataSource } from './data-source.js';
import { Product } from './product/entities/product.entity.js';
import { WorkshopSession } from './workshop/entities/workshop-session.entity.js';

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

const workshops = [
  {
    name: 'Cerâmica: do barro à caneca',
    description:
      'Modele e decore uma caneca autoral usando técnicas manuais de cerâmica.',
    image_url: 'https://placehold.co/600x400?text=Ceramica',
    price: 145,
    duration_minutes: 180,
    location: 'Ateliê Barro Vivo',
    sessions: [
      { daysFromToday: 7, hour: 9, capacity: 8 },
      { daysFromToday: 14, hour: 14, capacity: 10 },
    ],
  },
  {
    name: 'Velas aromáticas naturais',
    description:
      'Crie velas vegetais e aprenda a combinar ceras, pavios e fragrâncias.',
    image_url: 'https://placehold.co/600x400?text=Velas',
    price: 110,
    duration_minutes: 120,
    location: 'Casa das Essências',
    sessions: [
      { daysFromToday: 8, hour: 10, capacity: 12 },
      { daysFromToday: 15, hour: 15, capacity: 8 },
    ],
  },
  {
    name: 'Encadernação artesanal',
    description:
      'Monte um caderno costurado à mão e personalize capa, papel e acabamento.',
    image_url: 'https://placehold.co/600x400?text=Encadernacao',
    price: 125,
    duration_minutes: 150,
    location: 'Oficina Papel & Linha',
    sessions: [
      { daysFromToday: 9, hour: 9, capacity: 6 },
      { daysFromToday: 16, hour: 13, capacity: 8 },
    ],
  },
  {
    name: 'Introdução à tecelagem',
    description:
      'Experimente o tear manual e produza uma pequena peça têxtil colorida.',
    image_url: 'https://placehold.co/600x400?text=Tecelagem',
    price: 160,
    duration_minutes: 210,
    location: 'Estúdio Trama',
    sessions: [
      { daysFromToday: 10, hour: 10, capacity: 5 },
      { daysFromToday: 17, hour: 14, capacity: 7 },
    ],
  },
  {
    name: 'Aquarela botânica',
    description:
      'Pinte folhas e flores com aquarela, explorando mistura de cores e pinceladas.',
    image_url: 'https://placehold.co/600x400?text=Aquarela',
    price: 95,
    duration_minutes: 120,
    location: 'Jardim Oficina',
    sessions: [
      { daysFromToday: 11, hour: 9, capacity: 14 },
      { daysFromToday: 18, hour: 16, capacity: 10 },
    ],
  },
  {
    name: 'Marcenaria: tábua de servir',
    description:
      'Aprenda noções de corte, lixamento e acabamento criando uma tábua de madeira.',
    image_url: 'https://placehold.co/600x400?text=Marcenaria',
    price: 190,
    duration_minutes: 240,
    location: 'Galpão Madeira Boa',
    sessions: [
      { daysFromToday: 12, hour: 9, capacity: 6 },
      { daysFromToday: 19, hour: 13, capacity: 6 },
    ],
  },
  {
    name: 'Estamparia botânica em tecido',
    description:
      'Transfira formas e pigmentos de plantas para criar uma ecobag estampada.',
    image_url: 'https://placehold.co/600x400?text=Estamparia',
    price: 135,
    duration_minutes: 180,
    location: 'Quintal das Artes',
    sessions: [
      { daysFromToday: 13, hour: 10, capacity: 10 },
      { daysFromToday: 20, hour: 15, capacity: 12 },
    ],
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const productRepository = AppDataSource.getRepository(Product);
    const existingProducts = await productRepository.count();

    if (existingProducts > 0) {
      console.log(
        `Seed ignorada: já existem ${existingProducts} produtos cadastrados.`,
      );
    } else {
      await productRepository.save(productRepository.create(products));
      console.log(`Seed concluída: ${products.length} produtos inseridos.`);
    }

    const sessionRepository = AppDataSource.getRepository(WorkshopSession);
    let createdWorkshops = 0;
    let createdSessions = 0;

    for (const workshopSeed of workshops) {
      let workshop = await productRepository.findOneBy({
        name: workshopSeed.name,
        product_type: 'workshop',
      });

      if (!workshop) {
        workshop = await productRepository.save(
          productRepository.create({
            name: workshopSeed.name,
            description: workshopSeed.description,
            image_url: workshopSeed.image_url,
            price: workshopSeed.price,
            duration_minutes: workshopSeed.duration_minutes,
            location: workshopSeed.location,
            product_type: 'workshop',
            stock: 0,
            is_active: 1,
          }),
        );
        createdWorkshops += 1;
      }

      const existingSessions = await sessionRepository.count({
        where: { workshop: { id: workshop.id } },
      });
      if (existingSessions > 0) continue;

      const sessionEntities = workshopSeed.sessions.map((sessionSeed) => {
        const startsAt = new Date();
        startsAt.setDate(startsAt.getDate() + sessionSeed.daysFromToday);
        startsAt.setHours(sessionSeed.hour, 0, 0, 0);

        return sessionRepository.create({
          workshop,
          starts_at: startsAt,
          capacity: sessionSeed.capacity,
          booked_count: 0,
        });
      });

      await sessionRepository.save(sessionEntities);
      createdSessions += sessionEntities.length;
    }

    console.log(
      `Seed de oficinas concluída: ${createdWorkshops} oficinas e ${createdSessions} sessões inseridas.`,
    );
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
