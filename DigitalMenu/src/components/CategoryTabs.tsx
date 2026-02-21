import {
  Sparkles,
  Coffee,
  Cookie,
  ChefHat,
  Cake,
  Soup,
  Croissant,
   UtensilsCrossed,
   CakeSlice,
  Wine,
  Pizza,
  Sandwich,
} from "lucide-react";
import { ReactNode } from "react";

type CategoryTabsProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

const ICONS: Record<string, ReactNode> = {
  All: <Sparkles size={20} />,
  Drinks: <Wine size={20} />,
  Beverages: <Wine size={20} />,
  Snacks: <Cookie size={20} />,
  Meals: <ChefHat size={20} />,
  Desserts: <CakeSlice size={20} />,
 Starters: <UtensilsCrossed size={20} />,
  Breads: <Sandwich size={20} />,
  Pizza: <Pizza size={20} />,
  Sandwich: <Sandwich size={20} />,
};

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="tabs">
      {categories.map((c: string) => (
       <button
  key={c}
  className={`tabBtn ${active === c ? "tabBtnActive" : ""}`}
  onClick={() => onChange(c)}
  type="button"
>
  <span className="tabIcon">
    {ICONS[c] ?? <Sparkles size={18} />}
  </span>

  <span className="tabLabel">{c}</span>
</button>

      ))}
    </div>
  );
}