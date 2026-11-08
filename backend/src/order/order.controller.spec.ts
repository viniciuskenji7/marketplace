import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: { checkout: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('limits checkout to five requests per minute', () => {
    const checkoutHandler = Object.getOwnPropertyDescriptor(
      OrderController.prototype,
      'checkout',
    )?.value;

    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', checkoutHandler)).toBe(
      5,
    );
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', checkoutHandler)).toBe(
      60_000,
    );
  });
});
