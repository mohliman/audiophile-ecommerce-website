import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./CartContext";
import { CartModal, Categories, Footer, Modal, Navigation } from "./components";
import { Category, Home, NotFound, ProductPage } from "./pages";
import Checkout from "./Checkout";
import { categories, products } from "./shop";
import s from "./App.module.css";
function Shell() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const previous = useRef(location.pathname);
  useEffect(() => {
    const path = location.pathname;
    const product = products.find((p) => path === `/product/${p.slug}`);
    document.title = `${product?.name ?? (path === "/" ? "Premium audio" : path.slice(1).charAt(0).toUpperCase() + path.slice(2))} | Audiophile`;
    if (previous.current !== path) {
      setCartOpen(false);
      setMenuOpen(false);
      window.scrollTo(0, 0);
      main.current?.focus({ preventScroll: true });
      previous.current = path;
    }
  }, [location.pathname]);
  return (
    <>
      <a href="#main" className={s.skipLink}>
        Skip to content
      </a>
      <header
        className={`${s.header} ${location.pathname === "/" ? s.homeHeader : ""}`}
      >
        <div className={s.container}>
          <button
            className={s.menuButton}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <img src="/shared/tablet/icon-hamburger.svg" alt="" />
          </button>
          <Link to="/" aria-label="Audiophile home">
            <img
              src="/shared/desktop/logo.svg"
              alt="audiophile"
              width="143"
              height="25"
            />
          </Link>
          <Navigation />
          <button
            className={s.cartButton}
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            aria-expanded={cartOpen}
            onClick={() => setCartOpen(true)}
          >
            <img src="/shared/desktop/icon-cart.svg" alt="" />
            {cart.length > 0 && (
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            )}
          </button>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          {categories.map((category) => (
            <Route
              key={category}
              path={`/${category}`}
              element={<Category category={category} />}
            />
          ))}
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartModal open={cartOpen} close={() => setCartOpen(false)} />
      <Modal
        open={menuOpen}
        close={() => setMenuOpen(false)}
        title="Navigation"
        className={s.menuModal}
      >
        <button
          type="button"
          className={s.close}
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        >
          ×
        </button>
        <Categories close={() => setMenuOpen(false)} />
      </Modal>
    </>
  );
}
export default function App() {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>
  );
}
