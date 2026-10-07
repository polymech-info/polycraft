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
  link: "/store/product-details-one",
  image: "https://cdn.dribbble.com/userupload/3983170/file/original-10c57d98a2b4eee4aed803772590ae1e.png?compress=1&resize=1504x1128",
};
const two: Template = {
  description: "Pack of 6 icons",
  price: "Free",
   tag: "Icons",
   link: "/store/product-details-one",
  image: "https://cdn.dribbble.com/users/62525/screenshots/18281264/media/f88fcb06b6763d9942b1f633a24133d5.png?compress=1&resize=1600x1200&vertical=center",
};
const three: Template = {
  description: "Pack of 1049 solid icons",
  price: "$29",
   tag: "Icons",
   link: "/store/product-details-one",
  image: "https://cdn.dribbble.com/userupload/6659925/file/original-0b3a1676cc02f7dc3060251e5db1fe83.png?compress=1&resize=1504x1128",
};
const four: Template = {
  description: "Pack of 2000 icons",
  price: "$60",
   tag: "Icons",
   link: "/store/product-details-one",
  image: "https://cdn.dribbble.com/users/946315/screenshots/16889936/media/0e99861e7c3b55fa7137ba0ec6c9b40e.png?compress=1&resize=1600x1200&vertical=center",
};
export const byName = {
  one,
  three,
  two,
  four

};
export const icons = Object.values(byName);
