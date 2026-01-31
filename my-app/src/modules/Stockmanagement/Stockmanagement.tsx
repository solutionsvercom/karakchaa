
import { Button, Flex, Box, Text, Badge, Select } from "@radix-ui/themes";
import { Package2, AlertCircle, ShoppingCart, TrendingUp, History, Plus, Minus } from "lucide-react";
import { useState } from "react";
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
  const stockValue = data.reduce((sum, item) => sum + item.currentStock * 100, 0); // Assuming avg price 100

  return { totalProducts, lowStock, outOfStock, stockValue };
};

/* ================= COLUMNS ================= */

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
    render: (value) => (
      <Text weight="bold" size="2">
        {value} piece
      </Text>
    ),
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

/* ================= COMPONENT ================= */

export default function StockManagementModule() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showHistory, setShowHistory] = useState(false);
  const [stock] = useState<StockItem[]>(mockStockData);

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const { totalProducts, lowStock, outOfStock, stockValue } = calculateStockStats(stock);

  const categories = ["all", ...new Set(stock.map((item) => item.category))];

  return (
    <Flex direction="column" gap="5">
      {/* ================= STATS SECTION ================= */}
      <Flex gap="4" wrap="wrap">
        {/* Total Products */}
        <Box
          style={{
            flex: "1 1 200px",
            padding: "20px",
            background: "linear-gradient(135deg, #e0d5ff 0%, #f0e7ff 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Box style={{ fontSize: "32px" }}>
            <Package2 size={32} color="#a855f7" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray" style={{ marginBottom: "4px" }}>
              Total Products
            </Text>
            <Text size="7" weight="bold" style={{ fontSize: "28px", margin: 0 }}>
              {totalProducts}
            </Text>
          </Flex>
        </Box>

        {/* Low Stock */}
        <Box
          style={{
            flex: "1 1 200px",
            padding: "20px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fef08a 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Box style={{ fontSize: "32px" }}>
            <AlertCircle size={32} color="#eab308" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray" style={{ marginBottom: "4px" }}>
              Low Stock
            </Text>
            <Text size="7" weight="bold" style={{ fontSize: "28px", margin: 0 }}>
              {lowStock}
            </Text>
          </Flex>
        </Box>

        {/* Out of Stock */}
        <Box
          style={{
            flex: "1 1 200px",
            padding: "20px",
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Box style={{ fontSize: "32px" }}>
            <ShoppingCart size={32} color="#ef4444" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray" style={{ marginBottom: "4px" }}>
              Out of Stock
            </Text>
            <Text size="7" weight="bold" style={{ fontSize: "28px", margin: 0 }}>
              {outOfStock}
            </Text>
          </Flex>
        </Box>

        {/* Stock Value */}
        <Box
          style={{
            flex: "1 1 200px",
            padding: "20px",
            background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Box style={{ fontSize: "32px" }}>
            <TrendingUp size={32} color="#10b981" />
          </Box>
          <Flex direction="column">
            <Text size="2" color="gray" style={{ marginBottom: "4px" }}>
              Stock Value
            </Text>
            <Text size="7" weight="bold" style={{ fontSize: "28px", margin: 0, color: "#059669" }}>
              ₹{stockValue.toLocaleString()}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* ================= HEADER ================= */}
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--gray-7)",
            fontSize: "14px",
          }}
        />

        <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
          <Select.Trigger placeholder="All Products" style={{ minWidth: "140px" }} />
          <Select.Content>
            {categories.map((cat) => (
              <Select.Item key={cat} value={cat}>
                {cat === "all" ? "All Products" : cat}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Button
          variant={showHistory ? "solid" : "outline"}
          onClick={() => setShowHistory(!showHistory)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <History size={16} />
          Stock History
        </Button>
      </Flex>

      {/* ================= TABLE SECTION ================= */}
      {!showHistory && (
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Text size="4" weight="bold">Inventory Status</Text>
          </Flex>

          <Table<StockItem>
            data={filteredStock}
            columns={columns}
            emptyMessage="No products found"
            hoverable
            striped
          />
        </Flex>
      )}

      {/* ================= HISTORY SECTION ================= */}
      {showHistory && (
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Text size="4" weight="bold">Stock History</Text>
          </Flex>

          <Table<StockHistory>
            data={mockStockHistory}
            columns={[
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
                render: (value) => <Text weight="bold">+{value}</Text>,
                width: "15%",
                align: "center",
              },
              { key: "reason", header: "Reason", accessor: "reason", width: "20%" },
              { key: "date", header: "Date", accessor: "date", width: "25%" },
            ]}
            emptyMessage="No stock history found"
            hoverable
            striped
          />
        </Flex>
      )}
    </Flex>
  );
}
