import { useMemo, useState } from "react";
import { MENU } from "../data/sampleMenu";
import CategoryTabs from "../components/CategoryTabs";
import MenuCard from "../components/MenuCard";
import type { MenuItem } from "../types/menu";
import "../styles/menu.css";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";

export default function PublicMenu() {
  const [query, setQuery] = useState<string>("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [vegOnly, setVegOnly] = useState<boolean>(false);

  const { totalQty, subtotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const categories = useMemo<string[]>(() => {
    const unique = Array.from(new Set(MENU.map((m: MenuItem) => m.category)));
    return ["All", ...unique];
  }, []);

  const filtered = useMemo<MenuItem[]>(() => {
    const q = query.trim().toLowerCase();

    return MENU.filter((item: MenuItem) => {
      const matchesCat = activeCat === "All" || item.category === activeCat;

      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      const matchesVeg = !vegOnly || item.veg === true;

      return matchesCat && matchesQuery && matchesVeg;
    });
  }, [query, activeCat, vegOnly]);

  return (
    <div className="menuPage">
      {/* Sticky top */}
      <div className="stickyTop">
        <div className="container stickyInner">
          <header className="topHeader">
            <div className="brandBlock">
              <div className="brandName">Karakchaa</div>
              <div className="brandSub">Digital Menu</div>
            </div>

            <div className="headerRight">
              <label className="vegToggle" title="Show only vegetarian items">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                />
                <span className="vegSlider" />
                <span className="vegLabel">Veg</span>
              </label>

              <button
                className="cartIconBtn"
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                type="button"
              >
                <span className="cartIcon" aria-hidden>
                  🛍️
                </span>
                <span className="cartIconBadge" aria-label={`${totalQty} items`}>
                  {totalQty}
                </span>
              </button>
            </div>
          </header>

          <div className="searchWrap">
            <div className="searchIcon" aria-hidden>
              🔍
            </div>
            <input
              className="searchInput"
              placeholder="Search menu..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
          </div>

          <div className="tabsWrap">
            <CategoryTabs
              categories={categories}
              active={activeCat}
              onChange={setActiveCat}
            />
          </div>
        </div>
      </div>

      {/*  Only menu scrolls */}
      <div className="menuScrollArea">
        <div className="container">
          <div className="sectionTitle">
            {activeCat === "All" ? "All Items" : activeCat}
          </div>

          <div className="listGrid">
            {filtered.map((item: MenuItem) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>

          <div className="footerHint">Powered by Karakchaa • Digital Menu</div>
        </div>
      </div>

      
      {/*  Bottom cart bar */}
      {totalQty > 0 && !cartOpen ? (
        <button className="bottomCartBar" onClick={() => setCartOpen(true)} type="button">
          <div className="bottomCartLeft">
            <div className="bottomCartMiniIcon" aria-hidden>
              🛍️
            </div>
            <div className="bottomCartText">
              <div className="bottomCartCount">{totalQty} items</div>
              <div className="bottomCartAmount">₹{subtotal}</div>
            </div>
          </div>

          <div className="bottomCartRight">
            <span>View Cart</span>
            <span className="bottomCartArrow" aria-hidden>
              →
            </span>
          </div>
        </button>
      ) : null}


      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
