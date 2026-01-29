import { Button, Dialog, Flex } from "@radix-ui/themes";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import Form, { FormField } from "../../components/dynamicComponents/Form";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import ProductCard from "../../components/dynamicComponents/ProductCard";

/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "other";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: Category;
  image?: string;
};

/* ---------------- FORM FIELDS ---------------- */

const ProductsFields: FormField[] = [
  { name: "productName", label: "Product Name", type: "text", placeholder: "Enter product name", required: true },
  { name: "sku", label: "SKU", type: "text", placeholder: "Enter SKU" },
  { name: "price", label: "Price", type: "text", placeholder: "Enter price", required: true },
  { name: "stock", label: "Stock Quantity", type: "text", placeholder: "Enter stock quantity" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Product description..." },
];

/* ---------------- MOCK DATA ---------------- */

const mockProducts: Product[] = [
  { id: 1, name: "Pakora", sku: "SNK-002", price: 40, stock: 60, category: "snacks", image: "/images/pakora.jpg" },
  { id: 2, name: "Chicken Momos", sku: "SNK-004", price: 80, stock: 35, category: "snacks", image: "/images/Chicken-Momos.jpg" },
  { id: 3, name: "Gulab Jamun", sku: "DES-001", price: 50, stock: 45, category: "desserts", image: "/images/Gulab-Jamun.jpg" },
  { id: 4, name: "Samosa", sku: "SNK-001", price: 30, stock: 5, category: "snacks", image: "/images/Samosa.jpg" },
  { id: 5, name: "Cold Coffee", sku: "BEV-010", price: 70, stock: 12, category: "beverages", image: "/images/Cold-Coffee.jpg" },
];

/* ---------------- COMPONENT ---------------- */

export default function ProductsModule() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [products] = useState<Product[]>(mockProducts);

  const handleCreateProduct = async () => {
    console.log("Create confirmed");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

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

        <Dialog.Root>
          <Dialog.Trigger>
            <Button>+ Add Product</Button>
          </Dialog.Trigger>

          <Dialog.Content maxWidth="420px">
            <Flex justify="between" align="center" mb="4">
              <Flex align="center" gap="2">
                <UserPlus size={18} />
                <Dialog.Title style={{ fontSize: 18, fontWeight: 500 }}>
                  Add New Product
                </Dialog.Title>
              </Flex>

              <Dialog.Close>
                <Button className="dialog-close-icon">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>

            <Form fields={ProductsFields} />

        <Flex mt="4" gap="3">
          <Dialog.Close>
            <Button className="button outline" style={{ flex: 1 }}>
                      Cancel
                    </Button>
          </Dialog.Close>

              <DynamicAlertDialog
                title="Are you absolutely sure?"
                description="This action cannot be undone."
                cancelText="No, go back"
                actionText="Yes, Create"
                onAction={handleCreateProduct}
              >
                <Button className="create-btn" style={{ flex: 1 }}>
                  Create
                </Button>
              </DynamicAlertDialog>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {/* ================= SEARCH ================= */}
      <Flex justify="between" align="center" gap="4">
        <Flex style={{ flex: 1 }}>
          <Searchbar
            searchValue={search}
            onSearchChange={setSearch}
            selectedOption={category}
            onOptionChange={(value) =>
              setCategory(value as "all" | Category)
            }
            options={[
              { label: "All Categories", value: "all" },
              { label: "Snacks", value: "snacks" },
              { label: "Desserts", value: "desserts" },
              { label: "Beverages", value: "beverages" },
            ]}
            placeholder="Search products..."
          />
        </Flex>
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
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            sku={product.sku}
            price={product.price}
            stock={product.stock}
            category={product.category}
            image={product.image}
          />
        ))}
      </Flex>
    </Flex>
  );
}
