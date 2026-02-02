// modules/StockManagement/Stockmanagement.tsx
import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import {
  Button,
  Flex,
  Badge,
  DropdownMenu,
  Dialog,
} from "@radix-ui/themes";
import { ChevronDown, History, Plus, Minus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AddStock from "./AddStock";
import { SummaryCard } from "../../components/dynamicComponents/Cards";

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

/* ================= HELPERS ================= */

const getStockColor = (status: StockStatus): "green" | "yellow" | "red" =>
  status === "in-stock" ? "green" : status === "low-stock" ? "yellow" : "red";

const getStockLabel = (status: StockStatus) =>
  status === "in-stock"
    ? "In Stock"
    : status === "low-stock"
    ? "Low Stock"
    : "Out of Stock";

/* ================= MAIN COMPONENT ================= */

export default function Stockmanagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddStock = /\/stockmanagement\/\d+\/add-stock/.test(location.pathname);
  const isRemoveStock = /\/stockmanagement\/\d+\/remove-stock/.test(location.pathname);
  const isDialogOpen = isAddStock || isRemoveStock;

  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Products");
  const [showHistory, setShowHistory] = React.useState(false);
  const [stock] = React.useState<StockItem[]>(mockStockData);

  const selectedProduct = isDialogOpen
    ? stock.find((item) => location.pathname.includes(`/${item.id}/`))
    : undefined;

  /* ================= SUMMARY COUNTS ================= */

  const totalProducts = stock.length;
  const inStockCount = stock.filter((s) => s.status === "in-stock").length;
  const lowStockCount = stock.filter((s) => s.status === "low-stock").length;
  const outOfStockCount = stock.filter((s) => s.status === "out-of-stock").length;

  /* ================= FILTER ================= */

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
      width: "14%",
    },
    {
      key: "minLevel",
      header: "Min Level",
      accessor: "minLevel",
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
      width: "14%",
    },
    {
      key: "actions",
      header: "Actions",
      width: "16%",
      render: (_v, row) => (
        <Flex gap="2">
          <Button
            size="1"
            variant="ghost"
            onClick={() =>
              navigate(`/dashboard/stockmanagement/${row.id}/add-stock`)
            }
          >
            <Plus size={16} />
          </Button>
          <Button
            size="1"
            variant="ghost"
            onClick={() =>
              navigate(`/dashboard/stockmanagement/${row.id}/remove-stock`)
            }
          >
            <Minus size={16} />
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ===== SUMMARY CARDS (4) ===== */}
      <div className="kb-summary-row">
        <SummaryCard
          title="Total Products"
          value={String(totalProducts)}
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon="📦"
        />
        <SummaryCard
          title="In Stock"
          value={String(inStockCount)}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="✅"
        />
        <SummaryCard
          title="Low Stock"
          value={String(lowStockCount)}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="⚠️"
        />
        <SummaryCard
          title="Out of Stock"
          value={String(outOfStockCount)}
          accentColor="#D32F2F"
          softColor="#FDECEA"
          icon="❌"
        />
      </div>

      {/* ===== FILTER BAR ===== */}
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

      {/* ===== DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/stockmanagement");
        }}
      >
        <Dialog.Content maxWidth="420px">
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
