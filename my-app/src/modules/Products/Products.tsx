import { Button, Dialog, Flex } from "@radix-ui/themes";
import { DropdownMenu } from "@radix-ui/themes";
import { ChevronDown, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/Store";
import { fetchProducts } from "../../features/ProductsSlice";
import { fetchProductCategories } from "../../features/ProductCategoriesSlice";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";
import AddProducts from "./AddProduct";
import ManageCategoriesDialog from "./ManageCategoriesDialog";
import { ProductCardSkeleton } from "../../components/Skeleton";
import { deleteProduct } from "../../features/ProductsSlice";
import { toggleProductStatus } from "../../features/ProductsSlice";
import { categoryLabelForSlug } from "../../utils/categoryDisplay";
import { safeImageSrc } from "../../utils/imageUrl";

/* COMPONENT */

export default function ProductsModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading } = useSelector(
    (state: RootState) => state.product
  );
  const { categories: productCategories } = useSelector(
    (state: RootState) => state.productCategories
  );

  const activeCategories = useMemo(
    () => productCategories.filter((c) => c.isActive),
    [productCategories]
  );

  /*  URL MODE DETECTION */

  const isAddMode = location.pathname.includes("/add-product");
  const isEditMode = location.pathname.includes("/edit-product");
  const isDialogOpen = isAddMode || isEditMode;

  /* STATE  */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [stockStatus, setStockStatus] = useState<"all" | "low" | "out" | "active" | "inactive">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductCategories({ includeInactive: false }));
  }, [dispatch]);

  useEffect(() => {
    if (
      category !== "all" &&
      !activeCategories.some((c) => c.slug === category)
    ) {
      setCategory("all");
    }
  }, [category, activeCategories]);

  /*  EDIT PRODUCT DATA  */

  const editingProduct = isEditMode
    ? products.find((p: any) =>
      location.pathname.includes(`/${p._id}/edit-product`)
    )
    : undefined;

  /*  FILTER  */

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;

    let matchesStock = true;
    if (stockStatus === "low") {
      matchesStock = p.stockQty > 0 && p.stockQty <= (p.minStock || 0);
    } else if (stockStatus === "out") {
      matchesStock = p.stockQty <= 0;
    } else if (stockStatus === "active") {
      matchesStock = p.isActive === true;
    } else if (stockStatus === "inactive") {
      matchesStock = p.isActive === false;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <Flex direction="column" gap="4">
      {/* HEADER */}
      <Flex justify="between" align="center">
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            {filteredProducts.length} products in catalog
          </p>
        </div>

        <Flex gap="2" align="center">
          <Button variant="soft" onClick={() => setManageCategoriesOpen(true)}>
            <Plus size={16} aria-hidden />
            Add categories
          </Button>
          <Button onClick={() => navigate("/dashboard/products/add-product")}>
            + Add Product
          </Button>
        </Flex>
      </Flex>

      {/*  ADD / EDIT DIALOG */}
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

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      />

      {/*  SEARCH + FILTER  */}
      <Flex justify="between" align="center" gap="3">
        <Flex style={{ flex: 1 }}>
          <Searchbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search products..."
          />
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {category === "all"
                ? "All Categories"
                : categoryLabelForSlug(category, productCategories)}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setCategory("all")}>
              All Categories
            </DropdownMenu.Item>
            {activeCategories.map((c) => (
              <DropdownMenu.Item
                key={c._id}
                onSelect={() => setCategory(c.slug)}
              >
                {c.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {stockStatus === "all" ? "All Status"
                : stockStatus === "low" ? "Low Stock"
                  : stockStatus === "out" ? "Out of Stock"
                    : stockStatus === "active" ? "Active"
                      : "Inactive"}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setStockStatus("all")}>All Status</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setStockStatus("low")}>Low Stock</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setStockStatus("out")}>Out of Stock</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setStockStatus("active")}>Active</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setStockStatus("inactive")}>Inactive</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* PRODUCT GRID */}
      <Flex
        wrap="wrap"
        gap="4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {loading && products.length === 0 ? (
          <ProductCardSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <p style={{ padding: 16, color: "#6b7280", fontSize: 14 }}>
            No products found.
          </p>
        ) : (
          filteredProducts.map((product: any) => (
            <ProductCard
              key={product._id}
              name={product.name}
              sku={product.sku}
              price={product.sellingPrice}
              stock={product.stockQty}
              minStock={product.minStock}
              category={product.category}
              categoryDisplay={categoryLabelForSlug(
                product.category,
                productCategories
              )}
              image={safeImageSrc(product.image) || undefined}
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
          ))
        )}
      </Flex>

      {/*  DELETE CONFIRM DIALOG */}
      <Dialog.Root
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Product?</Dialog.Title>

          <p style={{ fontSize: 14, color: "#6b7280" }}>
            This action cannot be undone. This will also remove the product from
            Stock Management.
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