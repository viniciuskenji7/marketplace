
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithCart } from '../middleware/cart-id.middleware.js';

export const CartId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string =>
    ctx.switchToHttp().getRequest<RequestWithCart>().cartId,
);