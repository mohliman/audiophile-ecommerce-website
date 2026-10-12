import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { initialCheckout, money, totals, validateCheckout } from "./shop";
import { Back, CartRows, Modal } from "./components";
import type { CartItem, CheckoutValues } from "./types";
import s from "./App.module.css";
type Errors = Partial<Record<keyof CheckoutValues, string>>;
const fields = {
  name: ["Name", "Alex Smith", "name"],
  email: ["Email address", "alex@mail.com", "email"],
  phone: ["Phone number", "+1 202-555-0136", "tel"],
  address: ["Your address", "1137 Williams Avenue", "street-address"],
  zip: ["ZIP code", "10001", "postal-code"],
  city: ["City", "New York", "address-level2"],
  country: ["Country", "United States", "country-name"],
  money: ["e-Money number", "238521993", "off"],
  pin: ["e-Money PIN", "6891", "off"],
} as const;
type FieldName = keyof typeof fields;
export default function Checkout() {
  const { cart, clear } = useCart();
  const navigate = useNavigate();
  const [values, setValues] = useState<CheckoutValues>(initialCheckout);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<CartItem[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const total = totals(cart);
  const complete = () => {
    setOrder(null);
    clear();
    navigate("/");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!cart.length) return;
    const validation = validateCheckout(values);
    setErrors(validation);
    setSubmitted(true);
    const first = Object.keys(validation)[0];
    if (first) {
      form.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }
    setOrder(cart.map((item) => ({ ...item })));
    setExpanded(false);
    setValues(initialCheckout); // Payment details remain in memory only and are discarded on completion.
  };
  const field = (key: FieldName, wide = false) => {
    const [label, placeholder, autocomplete] = fields[key];
    return (
      <div
        className={`${s.field} ${wide ? s.wide : ""} ${errors[key] ? s.fieldError : ""}`}
        key={key}
      >
        <div>
          <label htmlFor={key}>{label}</label>
          {errors[key] && <span id={`${key}-error`}>{errors[key]}</span>}
        </div>
        <input
          id={key}
          name={key}
          value={values[key]}
          placeholder={placeholder}
          autoComplete={autocomplete}
          type={
            key === "email"
              ? "email"
              : key === "phone"
                ? "tel"
                : key === "pin"
                  ? "password"
                  : "text"
          }
          inputMode={key === "pin" || key === "money" ? "numeric" : undefined}
          maxLength={key === "pin" ? 4 : key === "money" ? 9 : 120}
          required
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
          onChange={(event) => {
            const next = { ...values, [key]: event.target.value };
            setValues(next);
            if (submitted) setErrors(validateCheckout(next));
          }}
          onBlur={() => {
            if (values[key].trim())
              setErrors((current) => ({
                ...current,
                [key]: validateCheckout(values)[key],
              }));
          }}
        />
      </div>
    );
  };
  if (!cart.length && !order)
    return (
      <div className={s.checkoutBackground}>
        <div className={`${s.container} ${s.emptyCheckout}`}>
          <h1>Your cart is empty</h1>
          <p>Add a product to begin checkout.</p>
          <Link className={s.button} to="/headphones">
            Explore headphones
          </Link>
        </div>
      </div>
    );
  return (
    <div className={s.checkoutBackground}>
      <div className={s.container}>
        <Back />
        <form
          ref={form}
          noValidate
          onSubmit={submit}
          className={s.checkoutLayout}
        >
          <div className={s.checkoutForm}>
            <h1>Checkout</h1>
            <fieldset>
              <legend>Billing details</legend>
              <div className={s.fieldGrid}>
                {field("name")}
                {field("email")}
                {field("phone")}
              </div>
            </fieldset>
            <fieldset>
              <legend>Shipping info</legend>
              <div className={s.fieldGrid}>
                {field("address", true)}
                {field("zip")}
                {field("city")}
                {field("country")}
              </div>
            </fieldset>
            <fieldset>
              <legend>Payment details</legend>
              <div className={s.paymentMethod}>
                <span>Payment method</span>
                <div>
                  {(["money", "cash"] as const).map((method) => (
                    <label
                      key={method}
                      className={`${s.radio} ${values.method === method ? s.selected : ""}`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={values.method === method}
                        onChange={() => {
                          const next = { ...values, method };
                          setValues(next);
                          if (submitted) setErrors(validateCheckout(next));
                        }}
                      />
                      {method === "money" ? "e-Money" : "Cash on delivery"}
                    </label>
                  ))}
                </div>
              </div>
              {values.method === "money" ? (
                <div className={s.fieldGrid}>
                  {field("money")}
                  {field("pin")}
                </div>
              ) : (
                <div className={s.cash}>
                  <img src="/checkout/icon-cash-on-delivery.svg" alt="" />
                  <p>
                    The ‘Cash on Delivery’ option enables you to pay in cash
                    when our delivery courier arrives at your residence. Just
                    make sure your address is correct so that your order will
                    not be cancelled.
                  </p>
                </div>
              )}
            </fieldset>
            <p className={s.demoNote}>
              Demo checkout. No payment is processed, order placed, or
              confirmation email sent. Use sample payment details.
            </p>
            {submitted && Object.values(errors).some(Boolean) && (
              <p className={s.errorSummary} role="alert">
                Please correct the highlighted fields to continue.
              </p>
            )}
          </div>
          <aside className={s.summary}>
            <h2>Summary</h2>
            <CartRows items={cart} />
            <div className={s.totals}>
              <div>
                <span>Total</span>
                <strong>{money(total.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{money(total.shipping)}</strong>
              </div>
              <div>
                <span>VAT (included)</span>
                <strong>{money(total.vat)}</strong>
              </div>
              <div className={s.grand}>
                <span>Grand total</span>
                <strong>{money(total.grand)}</strong>
              </div>
            </div>
            <button type="submit" className={`${s.button} ${s.full}`}>
              Continue &amp; pay
            </button>
          </aside>
        </form>
      </div>
      <Modal
        open={!!order}
        close={complete}
        title="Order confirmation"
        className={s.confirmation}
      >
        {order && (
          <>
            <img
              src="/checkout/icon-order-confirmation.svg"
              alt=""
              width="64"
              height="64"
            />
            <h2>
              Thank you
              <br />
              for your order
            </h2>
            <p>Your demo checkout is complete.</p>
            <p className={s.demoNote}>
              No payment was processed or email sent.
            </p>
            <div className={s.orderBox}>
              <div>
                <CartRows items={expanded ? order : order.slice(0, 1)} />
                {order.length > 1 && (
                  <button
                    type="button"
                    className={s.otherItems}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded
                      ? "View less"
                      : `and ${order.length - 1} other item(s)`}
                  </button>
                )}
              </div>
              <div className={s.orderTotal}>
                <span>Grand total</span>
                <strong>{money(totals(order).grand)}</strong>
              </div>
            </div>
            <button className={`${s.button} ${s.full}`} onClick={complete}>
              Back to home
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
