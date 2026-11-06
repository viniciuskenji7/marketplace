import { ICartItem } from "./ICartItem";

export interface ICart {
  items: ICartItem[];
  totalCents: number;
}