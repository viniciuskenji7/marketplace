import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrderModule } from './order/order.module.js';
import { MailModule } from './mail/mail.module.js';
import { CartMiddleware } from './cart/middleware/cart-id.middleware.js';
import { fileURLToPath } from 'node:url';

const migrationsPath = fileURLToPath(
  new URL('./migrations/*.{js,ts}', import.meta.url),
).replace(/\\/g, '/');

@Module({
  imports: [
    // Carrega as variaveis do .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',

        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: false,
        migrations: [migrationsPath],
        migrationsRun: true,
      })
    }),
    ProductModule,
    CartModule,
    OrderModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CartMiddleware).forRoutes('carrinho', 'finalizar-compra');
  }
}
