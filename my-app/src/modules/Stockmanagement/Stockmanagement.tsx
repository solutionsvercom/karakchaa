import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/Store";
import {
  fetchStockItems,
  fetchStockStats,
} from "../../features/StockmanagementSlice";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import Table, { Column } from "../../components/dynamicComponents/Table";
import { Button, Flex, Badge,IconButton, DropdownMenu, Dialog } from "@radix-ui/themes";
import { ChevronDown, History, Plus, Minus } from "lucide-react";
import AddStock from "./AddStock";
import StockHistory from "./StockHistory";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

/* ================= TYPES ================= */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type StockRow = {
  id: string;
  product: string;
  sku: string;
  category: string;
  currentStock: number;
  minLevel: number;
  status: StockStatus;
};

/* ================= HELPERS ================= */

export const getStockColor = (
  status: StockStatus
): "green" | "yellow" | "red" =>
  status === "In Stock" ? "green" : status === "Low Stock" ? "yellow" : "red";

/* ================= MAIN COMPONENT ================= */

export default function Stockmanagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { items, stats, loading } = useSelector(
    (state: RootState) => state.stock
  );

  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Products");

  // ✅ CHECK URL FOR STOCK HISTORY
  const isStockHistory = location.pathname.includes("/stock-history");
  const isAddStock = location.pathname.includes("/add-stock");
  const isRemoveStock = location.pathname.includes("/remove-stock");
  const isDialogOpen = isAddStock || isRemoveStock;

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchStockItems());
    dispatch(fetchStockStats());
  }, [dispatch]);

  // Find selected product for dialog
  const selectedProduct = items.find((item) => item._id === id);

  // Format items for table
  const formattedStock: StockRow[] = items.map((item) => ({
    id: item._id,
    product: item.productName,
    sku: item.sku,
    category: item.category,
    currentStock: item.currentStock,
    minLevel: item.minStockLevel,
    status: item.status,
  }));

  /* ================= FILTER ================= */

  const filteredStock = formattedStock.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchValue.toLowerCase());

    const matchesCategory =
      category === "All Products" ||
      (category === "Low Stock" && item.status === "Low Stock") ||
      (category === "Out of Stock" && item.status === "Out of Stock");

    return matchesSearch && matchesCategory;
  });

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<StockRow>[] = [
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
          {v}
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
          <IconButton
            size="1"
             variant="soft"
              radius="full"
            style={{ background: "var(--accent-4)",}}
            onClick={() =>
              navigate(`/dashboard/stockmanagement/${row.id}/add-stock`)
            }
          >
            <Plus size={16} />
          </IconButton>
          <IconButton
            size="1"
            variant="soft"
              radius="full"
            style={{ background: "var(--accent-4)",}}
            onClick={() =>
              navigate(`/dashboard/stockmanagement/${row.id}/remove-stock`)
            }
          >
            <Minus size={16} />
          </IconButton>
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
          value={String(stats?.totalProducts || 0)}
          accentColor="#2962FF"
          softColor="#E3F2FD"
          icon={<Package size={22} strokeWidth={2.2} /> as any}
        />

        <SummaryCard
          title="In Stock"
          value={String(stats?.inStock || 0)}
          accentColor="#00C853"
          softColor="#E5F9EE"
          icon={<CheckCircle2 size={22} strokeWidth={2.2} />as any}
        />

        <SummaryCard
          title="Low Stock"
          value={String(stats?.lowStock || 0)}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon={<AlertTriangle size={22} strokeWidth={2.2} />as any}
        />

        <SummaryCard
          title="Out of Stock"
          value={String(stats?.outOfStock || 0)}
          accentColor="#D32F2F"
          softColor="#FDECEA"
          icon={<XCircle size={22} strokeWidth={2.2} />as any}
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

        {/* ✅ UPDATED: Stock History Button with URL Navigation */}
        <Button
          variant={isStockHistory ? "solid" : "soft"}
          onClick={() =>
            navigate(
              isStockHistory
                ? "/dashboard/stockmanagement"
                : "/dashboard/stockmanagement/stock-history"
            )
          }
        >
          <History size={16} /> Stock History
        </Button>
      </Flex>

      {/* ✅ CONDITIONAL RENDERING BASED ON URL */}
      {!isStockHistory ? (
        <Table
          data={filteredStock}
          columns={columns}
          emptyMessage="No products found"
          hoverable
          striped
        />
      ) : (
        <StockHistory />
      )}

      {/* ===== DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/stockmanagement");
        }}
      >
        <Dialog.Content maxWidth="420px">
          <Dialog.Title style={{ display: "none" }}>
            {isAddStock ? "Add Stock" : "Remove Stock"}
          </Dialog.Title>

          {selectedProduct && (
            <AddStock
              key={selectedProduct._id}
              mode={isAddStock ? "add" : "remove"}
              productId={selectedProduct._id}
              product={{
                name: selectedProduct.productName,
                stock: selectedProduct.currentStock,
                unit: selectedProduct.unit,
              }}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}