import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { CartId } from '../cart/decorator/cart-id.decorator.js';
import { CheckoutDto } from './dto/checkout.dto.js';

@Controller('finalizar-compra')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  checkout(@CartId() cartId: string, @Body() checkoutOrderDto: CheckoutDto) {
    return this.orderService.checkout(cartId, checkoutOrderDto);
  }

}
