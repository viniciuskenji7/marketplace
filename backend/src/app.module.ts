import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrderModule } from './order/order.module.js';
import { OrderItemsModule } from './order_items/order_items.module.js';
import { MailModule } from './mail/mail.module.js';
import { CartMiddleware } from './cart/middleware/cart-id.middleware.js';
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
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: true,
        migrationsRun: true
      })
    }),
    ProductModule,
    CartModule,
    OrderModule,
    OrderItemsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CartMiddleware).forRoutes('cart', 'complete-purchase');
  }
}
