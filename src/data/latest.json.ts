export interface Template {
  description: string;
  image: string;
  link: string;
  price: string;
  tag: string;
};
const one: Template = {
  description: "iPhone 14 Pro Max",
  price: "$120",
  tag: "iPhone",
  link: "/store/product-details-one",
  image: "https://images.unsplash.com/photo-1510878933023-e2e2e3942fb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
};
const two: Template = {
  description: "Pack of 300 icons",
  price: "$9",
  tag: "Icons",
  link: "/store/product-details-one",
  image: "https://cdn.dribbble.com/users/62525/screenshots/18281264/media/f88fcb06b6763d9942b1f633a24133d5.png?compress=1&resize=1600x1200&vertical=center",
};
const three: Template = {
  description: "Phone 13 glass proteccion",
  price: "$120",
  tag: "iPhone",
  link: "/store/product-details-one",
  image: "https://images.unsplash.com/photo-1517777298614-cb6eefb19fad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
};

export const byName = {
  one,
  two,
  three,

};
export const latest = Object.values(byName);
