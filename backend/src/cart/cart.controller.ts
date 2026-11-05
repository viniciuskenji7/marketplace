import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { CartId } from "./decorator/cart-id.decorator.js";
import { CartService } from "./cart.service.js";
import { AddCartItemDto, UpdateCartItemDto } from "./dto/cart-item.dto.js";


@Controller('carrinho')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@CartId() cartId: string) {
    return this.cartService.getCart(cartId);
  }

  @Post()
  add(@CartId() cartId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(cartId, dto.productId, dto.quantity);
  }

  @Put()
  update(@CartId() cartId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(cartId, dto.productId, dto.quantity);
  }
}