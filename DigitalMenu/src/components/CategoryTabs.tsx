type CategoryTabsProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

const ICONS: Record<string, string> = {
  All: "🍽️",
  Drinks: "🥤",
  Beverages: "🥤",
  Snacks: "🍟",
  Meals: "🍛",
  Desserts: "🍨",
  Starters: "🥗",
  Breads: "🥖",
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
          <span className="tabIcon" aria-hidden>
            {ICONS[c] ?? "🍽️"}
          </span>
          <span className="tabLabel">{c}</span>
        </button>
      ))}
    </div>
  );
}
