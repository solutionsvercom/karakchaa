import { useMemo, useState,useEffect,JSX  } from "react";
import { MENU } from "../data/SampleMenu";
import CategoryTabs from "../components/CategoryTabs";
import MenuCard from "../components/MenuCard";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import { Search, ShoppingBag, ChevronRight } from "lucide-react";
import {
  Sparkles,
   UtensilsCrossed,
  Coffee,
  Cookie,
  ChefHat,
  Cake,
  Soup,
  CakeSlice,
  Croissant,
  Wine,
  Pizza,
  Sandwich,
  Wheat,
} from "lucide-react";

const categoryIcons: Record<string, JSX.Element> = {
  Drinks: <Coffee size={20} />,
  Beverages: <Wine size={20} />,
  Snacks: <Cookie size={20} />,
  Meals: <ChefHat size={20} />,
  Desserts: <CakeSlice size={20} />,
  Starters: <UtensilsCrossed size={20} />,
  Breads: <Sandwich size={20} />,
  Pizza: <Pizza size={20} />,
  Sandwich: <Sandwich size={20} />,
};


export default function PublicMenu() {

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
  if (cartOpen)
    document.body.style.overflow = "hidden";
  else
    document.body.style.overflow = "auto";

  return () => {
    document.body.style.overflow = "auto";
  };
}, [cartOpen]);


  const { totalQty, subtotal } = useCart();


  /*
  =====================================
  Get Categories (dynamic)
  =====================================
  */
  const categories = useMemo(() => {
    const unique = Array.from(new Set(MENU.map(item => item.category)));
    return ["All", ...unique];
  }, []);



  /*
  =====================================
  GLOBAL FILTER
  Works for both All and specific category
  =====================================
  */
  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    return MENU.filter(item => {

      const matchesCategory =
        activeCat === "All" || item.category === activeCat;

      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description &&
          item.description.toLowerCase().includes(q));

      const matchesVeg =
        !vegOnly || item.veg === true;

      return matchesCategory && matchesSearch && matchesVeg;

    });

  }, [query, activeCat, vegOnly]);



  return (
 <div className="menuContainer">
  <div className="bgOrbs">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
      </div>
    
    <div className="menuPage">


      {/* ================= HEADER ================= */}

      <div className="stickyTop">

        <div className="container stickyInner">

          <header className="topHeader">

            <div className="brandBlock">
              <div className="brandName">Karakchaa</div>
              <div className="brandSub">Digital Menu</div>
            </div>


            <div className="headerRight">

              {/* Veg Toggle */}

              <label className="vegToggle">

                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) =>
                    setVegOnly(e.target.checked)
                  }
                />

                <span className="vegSlider"></span>

                <span className="vegLabel">
                  Veg
                </span>

              </label>



              {/* Cart Icon */}

              <button
                className="cartIconBtn"
                onClick={() => setCartOpen(true)}
              >

                <ShoppingBag size={20} />

                <span className="cartIconBadge">
                  {totalQty}
                </span>

              </button>

            </div>

          </header>



          {/* SEARCH */}

          <div className="searchWrap">

            <Search size={18} />

            <input
              className="searchInput"
              placeholder="Search menu..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
            />

          </div>



          {/* CATEGORY TABS */}

          <CategoryTabs
            categories={categories}
            active={activeCat}
            onChange={setActiveCat}
          />

        </div>

      </div>



      {/* ================= MENU ================= */}

      <div className="menuScrollArea">

        <div className="container">


          {/* ALL CATEGORY VIEW */}

          {activeCat === "All" ? (

            categories
              .filter(cat => cat !== "All")
              .map(category => {

                const categoryItems =
                  filtered.filter(
                    item =>
                      item.category === category
                  );

                if (categoryItems.length === 0)
                  return null;

                return (

                  <div
                    key={category}
                    className="categoryBlock"
                  >

                    <div className="sectionTitleWithIcon">
  <span className="catIcon">
    {categoryIcons[category]}
  </span>

  <span>{category}</span>
</div>



                    <div className="listGrid">

                      {categoryItems.map(item => (
                        <MenuCard
                          key={item.id}
                          item={item}
                        />
                      ))}

                    </div>

                  </div>

                );

              })

          ) : (

            /* SINGLE CATEGORY VIEW */

            <div className="categoryBlock">
<div className="sectionTitle">

    <span className="sectionTitleIcon">
      {categoryIcons[activeCat]}
    </span>

    <span>
      {activeCat}
    </span>

  </div>

              <div className="listGrid">

                {filtered.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
                  />
                ))}

              </div>

            </div>

          )}



          {/* FOOTER */}

          <div className="footerHint">
            Powered by Karakchaa • Digital Menu
          </div>


        </div>

      </div>



      {/* ================= BOTTOM CART BAR ================= */}

   {!cartOpen && (
  <button
    className="bottomCartBar"
    onClick={() => setCartOpen(true)}
    type="button"
  >
    <div className="bottomCartLeft">
      <div className="bottomCartMiniIcon">
        <ShoppingBag size={20} />
      </div>

      <div className="bottomCartText">
        <div className="bottomCartCount">
          {totalQty} items
        </div>

        <div className="bottomCartAmount">
          ₹{subtotal}
        </div>
      </div>
    </div>

    <div className="bottomCartRight">
      View Cart
      <ChevronRight size={20} />
    </div>
  </button>
)}




     <CartDrawer
  open={cartOpen}
  onClose={() => setCartOpen(false)}
/>



    </div>
  </div>
  );
}
