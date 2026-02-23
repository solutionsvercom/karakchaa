import { Button, Dialog, Flex } from "@radix-ui/themes";
import { DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { fetchProducts } from "../../features/ProductsSlice";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import AddProducts from "./AddProduct";
import { deleteProduct } from "../../features/ProductsSlice";
import { toggleProductStatus } from "../../features/ProductsSlice";


/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "drinks" | "starters" | "breads" | "pizza" | "sandwich" | "other";

/* ---------------- COMPONENT ---------------- */

export default function ProductsModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading } = useSelector(
    (state: RootState) => state.product
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* ---------- URL MODE DETECTION ---------- */

  const isAddMode = location.pathname.includes("/add-product");
  const isEditMode = location.pathname.includes("/edit-product");
  const isDialogOpen = isAddMode || isEditMode;

  /* ---------- STATE ---------- */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");

  /* ---------- EDIT PRODUCT DATA ---------- */

  const editingProduct = isEditMode
    ? products.find((p: any) =>
        location.pathname.includes(`/${p._id}/edit-product`)
      )
    : undefined;

  /* ---------- FILTER ---------- */

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || p.category === category;

    return matchesSearch && matchesCategory;
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <Flex direction="column" gap="4">
      {/* ================= HEADER ================= */}
      <Flex justify="between" align="center">
        
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            {filteredProducts.length} products in catalog
          </p>
        </div>

        <Button onClick={() => navigate("/dashboard/products/add-product")}>
          + Add Product
        </Button>
      </Flex>

      {/* ================= ADD / EDIT DIALOG ================= */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/products");
        }}
      >
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title style={{ display: "none" }}>
            {isAddMode ? "Add Product" : "Edit Product"}
          </Dialog.Title>
          {isDialogOpen && (
            <AddProducts
              mode={isAddMode ? "create" : "edit"}
              initialValues={editingProduct}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* ================= SEARCH + FILTER ================= */}
      <Flex justify="between" align="center" gap="3">
  
        {/* SEARCH BAR */}
        <Flex style={{ flex: 1 }}>
          <Searchbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search products..."
          />
        </Flex>

        {/* CATEGORY DROPDOWN */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {category === "all"
                ? "All Categories"
                : category.charAt(0).toUpperCase() + category.slice(1)}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {[
              { label: "All Categories", value: "all" },
              { label: "Snacks", value: "snacks" },
              { label: "Desserts", value: "desserts" },
              { label: "Beverages", value: "beverages" },
              { label: "Meals", value: "meals" },
              { label: "Drinks", value: "drinks" },
              { label: "Starters", value: "starters" },
              { label: "Breads", value: "breads" },
              { label: "Pizza", value: "pizza" },
              { label: "Sandwich", value: "sandwich" },
              { label: "Other", value: "other" },
            ].map((item) => (
              <DropdownMenu.Item
                key={item.value}
                onSelect={() => setCategory(item.value as any)}
              >
                {item.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

      </Flex>


      {/* ================= PRODUCT GRID ================= */}
      <Flex
        wrap="wrap"
        gap="4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {filteredProducts.map((product: any) => (
          <ProductCard
            key={product._id}
            name={product.name}
            sku={product.sku}
            price={product.sellingPrice}
            stock={product.stockQty}
            category={product.category}
            image={product.image}
            isActive={product.isActive}
            onToggleActive={async (value: boolean) => {
              await dispatch(
                toggleProductStatus({
                  id: product._id,
                  isActive: value,
                })
              );
            }}
            onEdit={() =>
              navigate(`/dashboard/products/${product._id}/edit-product`)
            }
            onDelete={() => {
              setDeleteId(product._id);
            }}
          />
        ))}
      </Flex>

      {/* ================= DELETE CONFIRM DIALOG ================= */}
      <Dialog.Root open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Product?</Dialog.Title>

          <p style={{ fontSize: 14, color: "#6b7280" }}>
            This action cannot be undone. Are you sure you want to delete this product?
          </p>

          <Flex justify="end" gap="3" mt="4">
           <Button
  variant="soft"
  color="gray"
  onClick={() => setDeleteId(null)}
>
  Cancel
</Button>

            <Button
              color="red"
              onClick={async () => {
                if (deleteId) {
                  await dispatch(deleteProduct(deleteId));
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </Button>
          </Flex>

        </Dialog.Content>
      </Dialog.Root>

    </Flex>
  );
}