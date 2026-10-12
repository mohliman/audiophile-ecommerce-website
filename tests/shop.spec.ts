import { test, expect } from "@playwright/test";
import products from "../starter-code/data.json" with { type: "json" };
test("responsive pages render all supplied assets without overflow or runtime errors", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const routes = [
    "/",
    "/headphones",
    "/speakers",
    "/earphones",
    ...products.map((p) => "/product/" + p.slug),
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(/Audiophile/);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) {
        img.loading = "eager";
        await img.decode().catch(() => {});
      }
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `overflow on ${route}`,
    ).toBe(true);
    await expect
      .poll(
        () =>
          page
            .locator("img")
            .evaluateAll((images) =>
              images
                .filter((img) => !(img as HTMLImageElement).naturalWidth)
                .map((img) => (img as HTMLImageElement).currentSrc),
            ),
        { message: `broken image on ${route}` },
      )
      .toEqual([]);
    if (
      ["/", "/headphones", "/product/xx99-mark-two-headphones"].includes(route)
    )
      await page.screenshot({
        path: `test-results/${info.project.name}-${route === "/" ? "home" : route.includes("product") ? "product" : "category"}.png`,
        fullPage: true,
      });
  }
  expect(errors).toEqual([]);
});
test("cart, persistence, validation and e-Money confirmation work together", async ({
  page,
}, info) => {
  await page.goto("/product/xx99-mark-two-headphones");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 item added");
  await page.goto("/product/xx59-headphones");
  await page
    .getByRole("button", { name: "Increase XX59 Headphones quantity" })
    .click();
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Open cart, 3 items" }).click();
  const cart = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(cart).toContainText("$ 4,797");
  await cart
    .getByRole("button", { name: "Increase XX99 MK II quantity" })
    .click();
  await expect(cart).toContainText("$ 7,796");
  await cart
    .getByRole("button", { name: "Decrease XX99 MK II quantity" })
    .click();
  await page.screenshot({ path: `test-results/${info.project.name}-cart.png` });
  await page.keyboard.press("Escape");
  await expect(cart).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open cart, 3 items" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open cart, 3 items" }).click();
  await cart.getByRole("button", { name: "Checkout", exact: true }).click();
  await page.getByRole("button", { name: "Continue & pay" }).click();
  await expect(page.getByRole("alert")).toContainText("correct");
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  const values = {
    Name: "Alex Smith",
    "Email address": "alex@example.com",
    "Phone number": "+1 202-555-0136",
    "Your address": "1137 Williams Avenue",
    "ZIP code": "10001",
    City: "New York",
    Country: "United States",
    "e-Money number": "238521993",
    "e-Money PIN": "6891",
  };
  for (const [label, value] of Object.entries(values))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Email address").fill("invalid");
  await page.getByRole("button", { name: "Continue & pay" }).click();
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Email address").fill("alex@example.com");
  await expect(page.locator("aside")).toContainText("$ 959.4");
  await expect(page.locator("aside")).toContainText("$ 4,847");
  await page.screenshot({
    path: `test-results/${info.project.name}-checkout.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue & pay" }).click();
  const confirmation = page.getByRole("dialog", { name: "Order confirmation" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText("$ 4,847");
  await confirmation
    .getByRole("button", { name: "and 1 other item(s)", exact: true })
    .click();
  await expect(confirmation).toContainText("XX99 MK II");
  await expect(confirmation).toContainText("XX59");
  await page.screenshot({
    path: `test-results/${info.project.name}-confirmation.png`,
  });
  await confirmation.getByRole("button", { name: "Back to home" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5317/");
  await page.getByRole("button", { name: "Open cart, 0 items" }).click();
  await expect(
    page.getByRole("dialog", { name: "Shopping cart" }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Shopping cart" }),
  ).toContainText("Your cart is empty");
});
test("cash checkout, individual removal, remove all and empty checkout", async ({
  page,
}) => {
  await page.goto("/product/yx1-earphones");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.getByRole("button", { name: "Open cart, 1 items" }).click();
  const cart = page.getByRole("dialog", { name: "Shopping cart" });
  await cart.getByRole("button", { name: "Remove YX1", exact: true }).click();
  await expect(cart).toContainText("Your cart is empty");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.goto("/checkout");
  await page.getByLabel("Cash on delivery").check();
  await expect(page.getByLabel("e-Money number")).toHaveCount(0);
  for (const [label, value] of Object.entries({
    Name: "Alex Smith",
    "Email address": "alex@example.com",
    "Phone number": "08012345678",
    "Your address": "10 Main Street",
    "ZIP code": "100001",
    City: "Lagos",
    Country: "Nigeria",
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Continue & pay" }).click();
  await expect(
    page.getByRole("dialog", { name: "Order confirmation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to home" }).click();
  await page.goto("/product/zx9-speaker");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.getByRole("button", { name: "Open cart, 1 items" }).click();
  await cart.getByRole("button", { name: "Remove all" }).click();
  await expect(cart).toContainText("Your cart is empty");
  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeVisible();
});
test("navigation and dialog keyboard controls", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name !== "desktop") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    const menu = page.getByRole("dialog", { name: "Navigation" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /speakers shop/i }).click();
    await expect(menu).not.toBeVisible();
    await expect(page).toHaveURL(/\/speakers$/);
  } else {
    await page
      .locator("header")
      .getByRole("link", { name: /^headphones$/i })
      .click();
    await expect(page).toHaveURL(/\/headphones$/);
  }
  await page.getByRole("button", { name: "Open cart, 0 items" }).click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open cart, 0 items" }),
  ).toBeFocused();
});
