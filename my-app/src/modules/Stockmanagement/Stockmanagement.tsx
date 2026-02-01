import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { Button, Flex, Badge, DropdownMenu, Dialog } from "@radix-ui/themes";
import { ChevronDown, History, Plus, Minus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AddStock from "./AddStock";

/* ================= TYPES ================= */

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

type StockItem = {
  id: number;
  product: string;
  sku: string;
  category: string;
  currentStock: number;
  minLevel: number;
  status: StockStatus;
};

type StockHistory = {
  id: number;
  product: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  reason: string;
};

/* ================= MOCK DATA ================= */

const mockStockData: StockItem[] = [
  { id: 1, product: "Samosa", sku: "SNK-001", category: "Snacks", currentStock: 5, minLevel: 10, status: "low-stock" },
  { id: 2, product: "Cold Coffee", sku: "BEV-004", category: "Beverages", currentStock: 50, minLevel: 10, status: "in-stock" },
  { id: 3, product: "Veg Momos", sku: "SNK-003", category: "Snacks", currentStock: 40, minLevel: 10, status: "in-stock" },
  { id: 4, product: "Thali Meal", sku: "MEL-001", category: "Meals", currentStock: 25, minLevel: 8, status: "in-stock" },
  { id: 5, product: "Pakora", sku: "SNK-002", category: "Snacks", currentStock: 60, minLevel: 15, status: "in-stock" },
  { id: 6, product: "Chicken Momos", sku: "SNK-004", category: "Snacks", currentStock: 35, minLevel: 20, status: "in-stock" },
  { id: 7, product: "Gulab Jamun", sku: "DES-001", category: "Desserts", currentStock: 45, minLevel: 15, status: "in-stock" },
  { id: 8, product: "Biryani", sku: "MEL-002", category: "Meals", currentStock: 0, minLevel: 10, status: "out-of-stock" },
];

const mockStockHistory: StockHistory[] = [
  { id: 1, product: "Samosa", type: "out", quantity: 5, date: "30 Jan, 2:15 PM", reason: "Sales" },
  { id: 2, product: "Cold Coffee", type: "in", quantity: 20, date: "30 Jan, 11:00 AM", reason: "Restock" },
  { id: 3, product: "Veg Momos", type: "out", quantity: 10, date: "29 Jan, 4:30 PM", reason: "Sales" },
];

/* ================= HELPERS ================= */

const getStockColor = (status: StockStatus): "green" | "yellow" | "red" =>
  status === "in-stock" ? "green" : status === "low-stock" ? "yellow" : "red";

const getStockLabel = (status: StockStatus) =>
  status === "in-stock" ? "In Stock" : status === "low-stock" ? "Low Stock" : "Out of Stock";

/* ================= MAIN COMPONENT ================= */

export default function Stockmanagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddStock = /\/stockmanagement\/\d+\/add-stock/.test(location.pathname);
  const isRemoveStock = /\/stockmanagement\/\d+\/remove-stock/.test(location.pathname);
  //  const isAddStock = location.pathname.endsWith("/add-stock");
  // const isRemoveStock = location.pathname.endsWith("/remove-stock");
  const isDialogOpen = isAddStock || isRemoveStock;

  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Products");
  const [showHistory, setShowHistory] = React.useState(false);
  const [stock] = React.useState<StockItem[]>(mockStockData);

  const selectedProduct = isDialogOpen
    ? stock.find((item) => location.pathname.includes(`/${item.id}/`))
    : undefined;

  const filteredStock = stock.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchValue.toLowerCase());

    const matchesCategory =
      category === "All Products" ||
      (category === "Low Stock" && item.status === "low-stock") ||
      (category === "Out of Stock" && item.status === "out-of-stock");

    return matchesSearch && matchesCategory;
  });

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<StockItem>[] = [
    { key: "product", header: "Product", accessor: "product", width: "18%" },
    { key: "sku", header: "SKU", accessor: "sku", width: "12%" },
    { key: "category", header: "Category", accessor: "category", width: "14%" },
    {
      key: "currentStock",
      header: "Current Stock",
      accessor: "currentStock",
      render: (v) => <b>{v} piece</b>,
      align: "left",
      width: "14%",
    },
    {
      key: "minLevel",
      header: "Min Level",
      accessor: "minLevel",
      align: "left",
      width: "14%",
    },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (v) => (
        <Badge color={getStockColor(v)} variant="soft">
          {getStockLabel(v)}
        </Badge>
      ),
      align: "left",
      width: "14%",
    },
    {
      key: "actions",
      header: "Actions",
      width: "16%",
      // align: "left",
      render: (_v, row) => (
        <Flex gap="2" justify="start">
          <Button
            size="1"
            variant="ghost"
            onClick={() => navigate(`/dashboard/stockmanagement/${row.id}/add-stock`)}
          >
            <Plus size={16} />
          </Button>
          <Button
            size="1"
            variant="ghost"
            onClick={() => navigate(`/dashboard/stockmanagement/${row.id}/remove-stock`)}
          >
            <Minus size={16} />
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* FILTER BAR */}
      <Flex align="center" gap="3">
        <Searchbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          placeholder="Search products..."
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {category}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {["All Products", "Low Stock", "Out of Stock"].map((item) => (
              <DropdownMenu.Item key={item} onClick={() => setCategory(item)}>
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Button
          variant={showHistory ? "solid" : "soft"}
          onClick={() => setShowHistory(!showHistory)}
        >
          <History size={16} /> Stock History
        </Button>
      </Flex>

      {!showHistory && (
        <Table
          data={filteredStock}
          columns={columns}
          emptyMessage="No products found"
          hoverable
          striped
        />
      )}

      {/* DIALOG */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/stockmanagement");
        }}
      >
        <Dialog.Content maxWidth="420px">
          <Dialog.Title>
            {isAddStock ? "Add Stock" : "Remove Stock"}
          </Dialog.Title>

          {selectedProduct && (
            <AddStock
              mode={isAddStock ? "add" : "remove"}
              product={{
                id: selectedProduct.id,
                name: selectedProduct.product,
                stock: selectedProduct.currentStock,
                unit: "piece",
              }}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}