import data from "../starter-code/data.json";
import type { CartItem, CheckoutValues, Product } from "./types";
export const products: Product[] = data;
export const categories = ["headphones", "speakers", "earphones"] as const;
export const asset = (path: string) => path.replace(/^\.\/assets\//, "/");
export const money = (value: number) =>
  "$ " +
  value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
export const shortName = (p: Product) =>
  p.name
    .replace("Headphones", "")
    .replace("Wireless Earphones", "")
    .replace("Speaker", "")
    .replace("Mark II", "MK II")
    .replace("Mark I", "MK I")
    .trim();
export function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result = new Map<number, number>();
  for (const item of value) {
    if (
      !item ||
      !products.some((p) => p.id === item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )
      continue;
    result.set(
      item.id,
      Math.min(99, (result.get(item.id) ?? 0) + item.quantity),
    );
  }
  return [...result].map(([id, quantity]) => ({ id, quantity }));
}
export function setQuantity(
  cart: CartItem[],
  id: number,
  quantity: number,
): CartItem[] {
  const rest = cart.filter((item) => item.id !== id);
  if (quantity <= 0) return rest;
  if (!products.some((p) => p.id === id) || !Number.isInteger(quantity))
    return cart;
  return sanitizeCart([...rest, { id, quantity }]).sort((a, b) => a.id - b.id);
}
export function totals(cart: CartItem[]) {
  const subtotal = sanitizeCart(cart).reduce(
    (sum, item) =>
      sum + products.find((p) => p.id === item.id)!.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 50 : 0;
  return {
    subtotal,
    shipping,
    vat: Math.round(subtotal * 20) / 100,
    grand: subtotal + shipping,
  };
}
export const initialCheckout: CheckoutValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  zip: "",
  city: "",
  country: "",
  method: "money",
  money: "",
  pin: "",
};
export function validateCheckout(values: CheckoutValues) {
  const errors: Partial<Record<keyof CheckoutValues, string>> = {};
  const required: (keyof CheckoutValues)[] = [
    "name",
    "email",
    "phone",
    "address",
    "zip",
    "city",
    "country",
  ];
  if (values.method === "money") required.push("money", "pin");
  for (const key of required)
    if (!values[key].trim()) errors[key] = "Required field";
  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    errors.email = "Enter a valid email";
  if (
    values.phone.trim() &&
    (!/^[+\d() .-]+$/.test(values.phone) ||
      !/^\d{7,15}$/.test(values.phone.replace(/\D/g, "")))
  )
    errors.phone = "Enter a valid phone number";
  if (values.zip.trim() && !/^[a-z\d][a-z\d -]{1,11}$/i.test(values.zip.trim()))
    errors.zip = "Enter a valid postal code";
  if (values.method === "money") {
    if (values.money && !/^\d{9}$/.test(values.money))
      errors.money = "Use 9 digits";
    if (values.pin && !/^\d{4}$/.test(values.pin)) errors.pin = "Use 4 digits";
  }
  return errors;
}
