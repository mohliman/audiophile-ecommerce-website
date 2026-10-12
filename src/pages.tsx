import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import { products, money } from "./shop";
import {
  About,
  Back,
  Categories,
  homeImage,
  Picture,
  ProductLink,
  Quantity,
} from "./components";
import type { Product } from "./types";
import s from "./App.module.css";
export function Home() {
  return (
    <>
      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroCopy}>
            <span className={s.eyebrow}>New product</span>
            <h1>
              XX99 Mark II
              <br />
              Headphones
            </h1>
            <p>
              Experience natural, lifelike audio and exceptional build quality
              made for the passionate music enthusiast.
            </p>
            <ProductLink slug="xx99-mark-two-headphones" />
          </div>
        </div>
      </section>
      <div className={s.container}>
        <Categories />
        <section className={s.promos} aria-label="Featured products">
          <article className={s.zx9}>
            <Picture
              images={homeImage("image-speaker-zx9.png")}
              alt="ZX9 speaker"
            />
            <div>
              <h2>
                ZX9
                <br />
                Speaker
              </h2>
              <p>
                Upgrade to premium speakers that are phenomenally built to
                deliver truly remarkable sound.
              </p>
              <ProductLink slug="zx9-speaker" dark />
            </div>
          </article>
          <article className={s.zx7}>
            <div>
              <h2>ZX7 Speaker</h2>
              <ProductLink slug="zx7-speaker" outline />
            </div>
          </article>
          <article className={s.yx1}>
            <Picture
              images={homeImage("image-earphones-yx1.jpg")}
              alt="YX1 wireless earphones in their charging case"
            />
            <div>
              <h2>YX1 Earphones</h2>
              <ProductLink slug="yx1-earphones" outline />
            </div>
          </article>
        </section>
        <About />
      </div>
    </>
  );
}
function ProductDescription({
  product,
  detail = false,
}: {
  product: Product;
  detail?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const { add, cart } = useCart();
  const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
  const Heading = detail ? "h1" : "h2";
  return (
    <div className={s.productCopy}>
      {product.new && <span className={s.eyebrow}>New product</span>}
      <Heading className={s.productHeading}>{product.name}</Heading>
      <p>{product.description}</p>
      {detail ? (
        <>
          <strong className={s.price}>{money(product.price)}</strong>
          <div className={s.addRow}>
            <Quantity
              label={product.name}
              value={quantity}
              onChange={setQuantity}
              minimum={1}
            />
            <button
              className={s.button}
              disabled={inCart >= 99}
              onClick={() => {
                add(product.id, quantity);
                setNotice(
                  `${Math.min(quantity, 99 - inCart)} ${Math.min(quantity, 99 - inCart) === 1 ? "item" : "items"} added to cart.`,
                );
              }}
            >
              Add to cart
            </button>
          </div>
          <p className={s.addNotice} role="status">
            {inCart >= 99 ? "Maximum of 99 per product reached." : notice}
          </p>
        </>
      ) : (
        <ProductLink slug={product.slug} />
      )}
    </div>
  );
}
export function Category({ category }: { category: string }) {
  const list = products
    .filter((p) => p.category === category)
    .sort((a, b) => Number(b.new) - Number(a.new) || b.id - a.id);
  return (
    <>
      <div className={s.categoryTitle}>
        <h1>{category}</h1>
      </div>
      <div className={s.container}>
        <div className={s.productList}>
          {list.map((product, index) => (
            <article
              className={`${s.productRow} ${index % 2 ? s.reverse : ""}`}
              key={product.id}
            >
              <Picture
                images={product.categoryImage}
                alt={product.name}
                eager={index === 0}
              />
              <ProductDescription product={product} />
            </article>
          ))}
        </div>
        <Categories />
        <About />
      </div>
    </>
  );
}
export function ProductPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  if (!product) return <NotFound />;
  return (
    <div className={s.container}>
      <Back />
      <article>
        <div className={`${s.productRow} ${s.productDetail}`}>
          <Picture images={product.image} alt={product.name} eager />
          <ProductDescription key={product.id} product={product} detail />
        </div>
        <div className={s.features}>
          <section>
            <h2>Features</h2>
            {product.features.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
          <section className={s.includes}>
            <h2>In the box</h2>
            <ul>
              {product.includes.map((item) => (
                <li key={item.item}>
                  <strong>{item.quantity}x</strong>
                  <span>{item.item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className={s.gallery}>
          {Object.entries(product.gallery).map(([key, images], index) => (
            <Picture
              key={key}
              images={images}
              alt={`${product.name} ${index === 2 ? "in a listening room" : "detail " + (index + 1)}`}
            />
          ))}
        </div>
        <section className={s.recommendations}>
          <h2>You may also like</h2>
          <div>
            {product.others.map((other) => (
              <article key={other.slug}>
                <Picture images={other.image} alt={other.name} />
                <h3>{other.name}</h3>
                <ProductLink slug={other.slug} />
              </article>
            ))}
          </div>
        </section>
      </article>
      <Categories />
      <About />
    </div>
  );
}
export function NotFound() {
  return (
    <div className={`${s.container} ${s.notFound}`}>
      <h1>Page not found</h1>
      <p>We couldn’t find that page. Explore our collection instead.</p>
      <Link to="/" className={s.button}>
        Back to home
      </Link>
    </div>
  );
}
