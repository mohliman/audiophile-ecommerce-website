import { describe, expect, it } from "vitest";
import {
  initialCheckout,
  sanitizeCart,
  setQuantity,
  totals,
  validateCheckout,
} from "./shop";
describe("cart state", () => {
  it("rejects malformed persistence, unknown products and noninteger quantities", () => {
    expect(sanitizeCart(null)).toEqual([]);
    expect(
      sanitizeCart([
        null,
        { id: 400, quantity: 2 },
        { id: 4, quantity: -1 },
        { id: 4, quantity: 1.5 },
        { id: 4, quantity: "3" },
      ]),
    ).toEqual([]);
  });
  it("merges duplicates and limits quantities", () => {
    expect(
      sanitizeCart([
        { id: 4, quantity: 60 },
        { id: 4, quantity: 60 },
      ]),
    ).toEqual([{ id: 4, quantity: 99 }]);
  });
  it("updates one product and removes it at zero", () => {
    const cart = [
      { id: 4, quantity: 1 },
      { id: 2, quantity: 2 },
    ];
    expect(setQuantity(cart, 4, 0)).toEqual([{ id: 2, quantity: 2 }]);
    expect(setQuantity(cart, 4, 5).find((i) => i.id === 4)?.quantity).toBe(5);
    expect(setQuantity(cart, 400, 1)).toEqual(cart);
  });
});
describe("order totals", () => {
  it("uses all quantities, fixed shipping and 20% included VAT", () => {
    expect(
      totals([
        { id: 4, quantity: 1 },
        { id: 2, quantity: 2 },
        { id: 1, quantity: 1 },
      ]),
    ).toEqual({ subtotal: 5396, shipping: 50, vat: 1079.2, grand: 5446 });
  });
  it("does not charge shipping for an empty cart", () => {
    expect(totals([])).toEqual({ subtotal: 0, shipping: 0, vat: 0, grand: 0 });
  });
});
const valid = {
  ...initialCheckout,
  name: "Alex Smith",
  email: "alex@example.com",
  phone: "+1 (202) 555-0136",
  address: "1137 Williams Avenue",
  zip: "10001",
  city: "New York",
  country: "United States",
  money: "238521993",
  pin: "6891",
};
describe("checkout validation", () => {
  it("accepts valid input including international postal codes", () => {
    expect(validateCheckout(valid)).toEqual({});
    expect(validateCheckout({ ...valid, zip: "SW1A 1AA" })).toEqual({});
  });
  it("requires all billing, shipping and e-Money fields", () => {
    expect(Object.keys(validateCheckout(initialCheckout))).toHaveLength(9);
    expect(validateCheckout({ ...valid, name: "   " }).name).toBe(
      "Required field",
    );
  });
  it("rejects malformed email, phone, postal code and payment digits", () => {
    expect(
      Object.keys(
        validateCheckout({
          ...valid,
          email: "bad@",
          phone: "abc",
          zip: "?",
          money: "123",
          pin: "text",
        }),
      ),
    ).toEqual(["email", "phone", "zip", "money", "pin"]);
  });
  it("does not require payment digits for cash on delivery", () => {
    expect(
      validateCheckout({ ...valid, method: "cash", money: "", pin: "" }),
    ).toEqual({});
  });
});
