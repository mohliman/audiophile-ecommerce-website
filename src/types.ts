export type ImageSet = { mobile: string; tablet: string; desktop: string };
export type Product = {
  id: number;
  slug: string;
  name: string;
  image: ImageSet;
  category: string;
  categoryImage: ImageSet;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: { quantity: number; item: string }[];
  gallery: { first: ImageSet; second: ImageSet; third: ImageSet };
  others: { slug: string; name: string; image: ImageSet }[];
};
export type CartItem = { id: number; quantity: number };
export type CheckoutValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  method: "money" | "cash";
  money: string;
  pin: string;
};
