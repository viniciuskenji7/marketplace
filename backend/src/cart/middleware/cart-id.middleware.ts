import { Injectable, NestMiddleware } from "@nestjs/common";
import { isUUID } from "class-validator";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";



export const CART_COOKIE = 'cartId';
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface RequestWithCart extends Request {
    cartId: string;
}

@Injectable()
export class CartMiddleware implements NestMiddleware {
    use (req: RequestWithCart, res: Response, next: NextFunction) {
        let cartId: string | undefined = req.cookies?.[CART_COOKIE];
        
        if (!cartId || !isUUID(cartId, '4')) {
            cartId = randomUUID();
        }

        res.cookie(CART_COOKIE, cartId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: ONE_DAY_MS,
            path: '/',
        });
        
        req.cartId = cartId;
        next();
    }
}
