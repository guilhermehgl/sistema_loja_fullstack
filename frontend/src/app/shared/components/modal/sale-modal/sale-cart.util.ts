interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface ProductLike {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function addItemToCart(cart: CartItem[], product: ProductLike): CartItem[] {
  if (product.quantity <= 0) return cart;

  const item = cart.find((i) => i.productId === product.id);
  if (item) {
    if (item.quantity < item.stock) item.quantity++;
    return [...cart];
  }

  return [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.quantity,
    },
  ];
}

export function removeOrDecrease(cart: CartItem[], target: CartItem): CartItem[] {
  const next = cart.map((item) => ({ ...item }));
  const found = next.find((item) => item.productId === target.productId);
  if (!found) return cart;

  found.quantity--;
  return found.quantity <= 0 ? next.filter((item) => item.productId !== target.productId) : next;
}

export function increaseItem(cartItem: CartItem): CartItem {
  return {
    ...cartItem,
    quantity: Math.min(cartItem.quantity + 1, cartItem.stock),
  };
}

export function normalizeCartQuantity(value: number, stock: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(Math.floor(value), stock);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export type { CartItem };
