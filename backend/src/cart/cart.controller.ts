import { Controller, Get } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartId } from './decorator/cart-id.decorator.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CartId() cartId: string) {
    return this.cartService.getCart(cartId)
  }
}
