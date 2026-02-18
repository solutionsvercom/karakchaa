import type { MenuItem } from "../types/menu";

export const MENU: MenuItem[] = [
  {
    id: "1",
    name: "Paneer Tikka",
    category: "Starters",
    price: 220,
    description: "Smoky grilled paneer with spices and onion salad.",
    veg: true,
    available: true,
    image:
      "https://lentillovingfamily.com/wp-content/uploads/2025/08/paneer-tikka-4.jpg",
  },
  {
    id: "2",
    name: "Chicken Wings",
    category: "Starters",
    price: 260,
    description: "Crispy wings with tangy sauce.",
    veg: false,
    available: true,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Butter Naan",
    category: "Breads",
    price: 45,
    description: "Soft naan brushed with butter.",
    veg: true,
    available: true,
    image:
      "https://as2.ftcdn.net/v2/jpg/17/15/16/93/1000_F_1715169355_cAjyCT1V26tJbHqmlqqXT8rKNgRvFiHk.jpg",
  },
  {
    id: "4",
    name: "Cold Coffee",
    category: "Beverages",
    price: 120,
    description: "Chilled coffee with creamy foam.",
    veg: true,
    available: false,
    image:
      "https://mytastycurry.com/wp-content/uploads/2020/04/Cafe-style-cold-coffee-with-icecream.jpg",
  },
  {
  id: "veg-momos",
  name: "Veg Momos",
  description: "Steamed dumplings with spicy chutney",
  price: 60,
  category: "Snacks",
  image: "https://newhongkong.in/wp-content/uploads/2020/12/Easy-Steamed-Vegetable-Dumplings.jpeg",
  available: true,
  veg: true,
},
{
  id: "chicken-biryani",
  name: "Chicken Biryani",
  description: "Aromatic basmati rice with chicken",
  price: 240,
  category: "Meals",
  image: "https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani.jpg",
  available: true,
  veg: false,
},
{
  id: "gulab-jamun",
  name: "Gulab Jamun",
  description: "Soft sweet dumplings in syrup",
  price: 90,
  category: "Desserts",
  image: "https://images.unsplash.com/photo-1604908177223-5e4f6e76b6c5",
  available: true,
  veg: true,
},
{
  id: "mango-shake",
  name: "Mango Shake",
  description: "Fresh mango milkshake",
  price: 140,
  category: "Beverages",
  image: "https://images.unsplash.com/photo-1604908177036-7f3d9e3f5d6c",
  available: true,
  veg: true,
},

];
