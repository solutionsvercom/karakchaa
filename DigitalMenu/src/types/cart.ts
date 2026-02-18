import type { MenuItem } from "./menu";

export type CartItem = {
  item: MenuItem;
  qty: number;
};

export type CartState = {
  items: Record<string, CartItem>; // key = MenuItem.id
};
