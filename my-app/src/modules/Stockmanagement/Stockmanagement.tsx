import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Button, Flex, Badge, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown, History, Plus, Minus } from "lucide-react";
import Table, { Column } from "../../components/dynamicComponents/Table";

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

/* ================= HELPER FUNCTIONS ================= */

const getStockColor = (status: StockStatus): "green" | "yellow" | "red" => {
  switch (status) {
    case "in-stock":
      return "green";
    case "low-stock":
      return "yellow";
    case "out-of-stock":
      return "red";
    default:
      return "red";
  }
};

const getStockLabel = (status: StockStatus) => {
  return status === "in-stock" ? "In Stock" : status === "low-stock" ? "Low Stock" : "Out of Stock";
};

const calculateStockStats = (data: StockItem[]) => {
  const totalProducts = data.length;
  const lowStock = data.filter((item) => item.status === "low-stock").length;
  const outOfStock = data.filter((item) => item.status === "out-of-stock").length;
  const stockValue = data.reduce((sum, item) => sum + item.currentStock * 100, 0);

  return { totalProducts, lowStock, outOfStock, stockValue };
};

/* ================= SUMMARY CARD COMPONENT ================= */

type SummaryCardProps = {
  title: string;
  value: string;
  accentColor: string;
  softColor: string;
  icon: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  accentColor,
  softColor,
  icon,
}) => {
  return (
    <div className="kb-summary-card">
      <div>
        <div className="kb-summary-card-title">{title}</div>
        <div className="kb-summary-card-value">{value}</div>
      </div>

      <div
        className="kb-summary-card-icon-wrapper"
        style={{ backgroundColor: softColor }}
      >
        <div
          className="kb-summary-card-icon-circle"
          style={{ backgroundColor: accentColor }}
        >
          <span className="kb-summary-card-icon">{icon}</span>
        </div>
      </div>
    </div>
  );
};

/* ================= TABLE COLUMNS ================= */

const columns: Column<StockItem>[] = [
  {
    key: "product",
    header: "Product",
    accessor: "product",
    width: "18%",
  },
  {
    key: "sku",
    header: "SKU",
    accessor: "sku",
    width: "12%",
  },
  {
    key: "category",
    header: "Category",
    accessor: "category",
    width: "14%",
  },
  {
    key: "currentStock",
    header: "Current Stock",
    accessor: "currentStock",
    render: (value) => <span style={{ fontWeight: "bold" }}>{value} piece</span>,
    width: "14%",
    align: "center",
  },
  {
    key: "minLevel",
    header: "Min Level",
    accessor: "minLevel",
    width: "12%",
    align: "center",
  },
  {
    key: "status",
    header: "Status",
    accessor: "status",
    render: (value: StockStatus) => (
      <Badge color={getStockColor(value)} variant="soft">
        {getStockLabel(value)}
      </Badge>
    ),
    width: "14%",
    align: "center",
  },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <Flex gap="2" justify="center">
        <Button
          size="1"
          variant="ghost"
          style={{ padding: "4px 8px" }}
          onClick={() => console.log("Add stock")}
        >
          <Plus size={16} />
        </Button>
        <Button
          size="1"
          variant="ghost"
          style={{ padding: "4px 8px" }}
          onClick={() => console.log("Remove stock")}
        >
          <Minus size={16} />
        </Button>
      </Flex>
    ),
    width: "16%",
    align: "center",
  },
];

const historyColumns: Column<StockHistory>[] = [
  { key: "product", header: "Product", accessor: "product", width: "25%" },
  {
    key: "type",
    header: "Type",
    accessor: "type",
    render: (value) => (
      <Badge color={value === "in" ? "green" : "red"} variant="soft">
        {value === "in" ? "Stock In" : "Stock Out"}
      </Badge>
    ),
    width: "15%",
  },
  {
    key: "quantity",
    header: "Quantity",
    accessor: "quantity",
    render: (value) => <span style={{ fontWeight: "bold" }}>+{value}</span>,
    width: "15%",
    align: "center",
  },
  { key: "reason", header: "Reason", accessor: "reason", width: "20%" },
  { key: "date", header: "Date", accessor: "date", width: "25%" },
];

/* ================= MAIN COMPONENT ================= */

export default function Stockmanagement() {
  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Products");
  const [showHistory, setShowHistory] = React.useState(false);
  const [stock] = React.useState<StockItem[]>(mockStockData);

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

  const { totalProducts, lowStock, outOfStock, stockValue } = calculateStockStats(stock);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* SUMMARY CARDS with Dynamic Data */}
      <section className="kb-summary-row">
        <SummaryCard
          title="Total Products"
          value={String(totalProducts)}
          accentColor="#7C4DFF"
          softColor="#EDE7FF"
          icon="📦"
        />

        <SummaryCard
          title="Low Stock"
          value={String(lowStock)}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="⚠️"
        />

        <SummaryCard
          title="Out of Stock"
          value={String(outOfStock)}
          accentColor="#D50000"
          softColor="#FDECEA"
          icon="❌"
        />

        <SummaryCard
          title="Stock Value"
          value={`₹${stockValue.toLocaleString()}`}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon="📈"
        />
      </section>

      {/* FILTER BAR */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid var(--gray-6)",
          background: "var(--gray-1)",
        }}
      >
        <Flex align="center" gap="3" wrap="wrap">
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
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Button
            variant={showHistory ? "solid" : "soft"}
            onClick={() => setShowHistory(!showHistory)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <History size={16} />
            Stock History
          </Button>
        </Flex>
      </div>

      {/* INVENTORY TABLE */}
      {!showHistory && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Inventory Status</h2>
          <Table<StockItem>
            data={filteredStock}
            columns={columns}
            emptyMessage="No products found"
            hoverable
            striped
          />
        </div>
      )}

      {/* STOCK HISTORY TABLE */}
      {showHistory && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Stock History</h2>
          <Table<StockHistory>
            data={mockStockHistory}
            columns={historyColumns}
            emptyMessage="No stock history found"
            hoverable
            striped
          />
        </div>
      )}
    </div>
  );
}
