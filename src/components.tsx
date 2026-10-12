import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { CartItem, ImageSet } from "./types";
import { asset, categories, money, products, shortName, totals } from "./shop";
import { useCart } from "./CartContext";
import s from "./App.module.css";
export function Picture({
  images,
  alt,
  className,
  eager = false,
}: {
  images: ImageSet;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <picture className={className}>
      <source media="(min-width: 1024px)" srcSet={asset(images.desktop)} />
      <source media="(min-width: 600px)" srcSet={asset(images.tablet)} />
      <img
        src={asset(images.mobile)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
      />
    </picture>
  );
}
export const homeImage = (file: string): ImageSet => ({
  mobile: `/home/mobile/${file}`,
  tablet: `/home/tablet/${file}`,
  desktop: `/home/desktop/${file}`,
});
export function ProductLink({
  slug,
  dark = false,
  outline = false,
}: {
  slug: string;
  dark?: boolean;
  outline?: boolean;
}) {
  return (
    <Link
      className={`${s.button} ${dark ? s.dark : ""} ${outline ? s.outline : ""}`}
      to={`/product/${slug}`}
    >
      See product
    </Link>
  );
}
export function Navigation({ close }: { close?: () => void }) {
  return (
    <nav aria-label="Main navigation" className={s.nav}>
      <NavLink onClick={close} to="/" end>
        Home
      </NavLink>
      {categories.map((category) => (
        <NavLink key={category} onClick={close} to={`/${category}`}>
          {category}
        </NavLink>
      ))}
    </nav>
  );
}
export function Categories({ close }: { close?: () => void }) {
  return (
    <div className={s.categories}>
      {categories.map((category) => (
        <Link
          onClick={close}
          key={category}
          to={`/${category}`}
          className={s.categoryCard}
        >
          <img
            src={`/shared/desktop/image-category-thumbnail-${category}.png`}
            alt=""
          />
          <h3>{category}</h3>
          <span>
            Shop <img src="/shared/desktop/icon-arrow-right.svg" alt="" />
          </span>
        </Link>
      ))}
    </div>
  );
}
export function About() {
  return (
    <section className={s.about}>
      <Picture
        images={{
          mobile: "/shared/mobile/image-best-gear.jpg",
          tablet: "/shared/tablet/image-best-gear.jpg",
          desktop: "/shared/desktop/image-best-gear.jpg",
        }}
        alt="Music enthusiast listening to headphones in the Audiophile showroom"
      />
      <div>
        <h2>
          Bringing you the <em>best</em> audio gear
        </h2>
        <p>
          Located at the heart of New York City, Audiophile is the premier store
          for high end headphones, earphones, speakers, and audio accessories.
          We have a large showroom and luxury demonstration rooms available for
          you to browse and experience a wide range of our products. Stop by our
          store to meet some of the fantastic people who make Audiophile the
          best place to buy your portable audio equipment.
        </p>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerTop}>
          <Link to="/" aria-label="Audiophile home">
            <img
              src="/shared/desktop/logo.svg"
              alt="audiophile"
              width="143"
              height="25"
            />
          </Link>
          <Navigation />
        </div>
        <p>
          Audiophile is an all in one stop to fulfill your audio needs. We're a
          small team of music lovers and sound specialists who are devoted to
          helping you get the most out of personal audio. Come and visit our
          demo facility – we’re open 7 days a week.
        </p>
        <div className={s.footerBottom}>
          <p>Copyright 2021. All Rights Reserved</p>
          <div className={s.socials}>
            {["facebook", "twitter", "instagram"].map((name) => (
              <a
                key={name}
                href={`https://www.${name}.com/`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Audiophile on ${name}`}
              >
                <img src={`/shared/desktop/icon-${name}.svg`} alt="" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
export function Quantity({
  value,
  onChange,
  label,
  minimum = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  minimum?: number;
}) {
  return (
    <div className={s.quantity} role="group" aria-label={`${label} quantity`}>
      <button
        type="button"
        disabled={value <= minimum}
        onClick={() => onChange(value - 1)}
        aria-label={`Decrease ${label} quantity`}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label} quantity`}
      >
        +
      </button>
    </div>
  );
}
export function Modal({
  open,
  close,
  title,
  className = "",
  children,
}: {
  open: boolean;
  close: () => void;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    if (!open) {
      dialog.close();
      return;
    }
    dialog.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = original;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`${s.modal} ${className}`}
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]',
          ),
        ].filter((control) => control.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      {children}
    </dialog>
  );
}
export function CartRows({
  items,
  editable = false,
}: {
  items: CartItem[];
  editable?: boolean;
}) {
  const { update } = useCart();
  return (
    <ul className={s.cartRows}>
      {items.map((item) => {
        const p = products.find((p) => p.id === item.id)!;
        return (
          <li key={item.id}>
            <img src={`/cart/image-${p.slug}.jpg`} alt={p.name} />
            <div>
              <strong>{shortName(p)}</strong>
              <span>{money(p.price)}</span>
            </div>
            {editable ? (
              <div className={s.cartControls}>
                <Quantity
                  label={shortName(p)}
                  value={item.quantity}
                  onChange={(quantity) => update(item.id, quantity)}
                />
                <button
                  type="button"
                  className={s.remove}
                  onClick={() => update(item.id, 0)}
                  aria-label={`Remove ${shortName(p)}`}
                >
                  Remove
                </button>
              </div>
            ) : (
              <span className={s.count}>x{item.quantity}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
export function CartModal({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { cart, clear, storageError } = useCart();
  const navigate = useNavigate();
  return (
    <Modal
      open={open}
      close={close}
      title="Shopping cart"
      className={s.cartModal}
    >
      <div className={s.modalHeading}>
        <h3>Cart ({cart.length})</h3>
        <button
          type="button"
          onClick={close}
          className={s.close}
          aria-label="Close cart"
        >
          ×
        </button>
      </div>
      {cart.length ? (
        <>
          <button className={s.removeAll} onClick={clear}>
            Remove all
          </button>
          <CartRows items={cart} editable />
          <div className={s.total}>
            <span>Total</span>
            <strong>{money(totals(cart).subtotal)}</strong>
          </div>
          <button
            className={`${s.button} ${s.full}`}
            onClick={() => {
              close();
              navigate("/checkout");
            }}
          >
            Checkout
          </button>
        </>
      ) : (
        <div className={s.empty}>
          <p>Your cart is empty.</p>
          <p>Find your next favourite sound.</p>
          <button
            className={s.button}
            onClick={() => {
              close();
              navigate("/headphones");
            }}
          >
            Explore headphones
          </button>
        </div>
      )}
      {storageError && (
        <p role="status">
          Your browser cannot save this cart. It will last for this visit.
        </p>
      )}
    </Modal>
  );
}
export function Back() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={s.back}
      onClick={() => {
        if (window.history.state?.idx > 0) navigate(-1);
        else navigate("/");
      }}
    >
      Go back
    </button>
  );
}
