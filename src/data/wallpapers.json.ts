export interface Template {
  description: string;
  image: string;
  link: string;
  price: string;
  tag: string;
};
const one: Template = {
  description: "Pack of 3000  icons",
  price: "$120",
  tag: "Icons",
  link: "/store/product-details-two",
  image: "https://cdn.dribbble.com/users/4476902/screenshots/15234197/media/7f5b17136179637f185ddf4ea4e4eff0.png?compress=1&resize=1600x1200&vertical=center",
};
const two: Template = {
  description: "Pack of 6 icons",
  price: "Free",
   tag: "Icons",
   link: "/store/product-details-two",
  image: "https://cdn.dribbble.com/users/161873/screenshots/17526601/media/ab4f5b5222e310966bfd4cf0187b38ef.jpg?compress=1&resize=1600x1200&vertical=center",
};
const three: Template = {
  description: "Pack of 1049 solid icons",
  price: "$29",
   tag: "Icons",
   link: "/store/product-details-two",
  image: "https://cdn.dribbble.com/users/1408866/screenshots/16747223/media/63e22c4946662eaca12052668796c20d.jpg?compress=1&resize=1600x1200&vertical=center",
};
const four: Template = {
  description: "Pack of 2000 icons",
  price: "$60",
   tag: "Icons",
   link: "/store/product-details-two",
  image: "https://cdn.dribbble.com/users/1408866/screenshots/16747180/media/6fbf7eddc55721bc62663153d660b64d.jpg?compress=1&resize=1600x1200&vertical=center",
};
export const byName = {
  one,
  two,
  three,
  four

};
export const wallpapers = Object.values(byName);
