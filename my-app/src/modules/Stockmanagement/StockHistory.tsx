import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { fetchStockItems } from "../../features/StockmanagementSlice";
import { Flex, Text, Badge, Button, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import Table, { Column } from "../../components/dynamicComponents/Table";
import Searchbar from "../../components/dynamicComponents/Searchbar";

/* ================= TYPES ================= */

type HistoryRow = {
  id: string;
  productName: string;
  action: "add" | "remove";
  quantity: number;
  reason: string;
  referenceNo?: string;
  notes?: string;
  date: string;
  timestamp: number; // For sorting
};

/* ================= COMPONENT ================= */

export default function StockHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.stock);

  const [searchValue, setSearchValue] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("All Actions");

  useEffect(() => {
    dispatch(fetchStockItems());
  }, [dispatch]);

  // Combine all stock history from all products
  const allHistory: HistoryRow[] = items.flatMap((item) =>
    item.stockHistory.map((history, index) => {
      const createdDate = new Date(history.createdAt);
      return {
        id: `${item._id}-${index}`,
        productName: item.productName,
        action: history.action,
        quantity: history.quantity,
        reason: history.reason,
        referenceNo: history.referenceNo,
        notes: history.notes,
        date: createdDate.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: createdDate.getTime(),
      };
    })
  );

  // Sort by date (most recent first)
  const sortedHistory = allHistory.sort((a, b) => b.timestamp - a.timestamp);

  /* ================= FILTERING ================= */

  const filteredHistory = sortedHistory.filter((item) => {
    // Search filter (product name, reason, or reference)
    const matchesSearch =
      item.productName.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchValue.toLowerCase()) ||
      (item.referenceNo || "").toLowerCase().includes(searchValue.toLowerCase());

    // Action filter
    const matchesAction =
      actionFilter === "All Actions" ||
      (actionFilter === "Added" && item.action === "add") ||
      (actionFilter === "Removed" && item.action === "remove");

    return matchesSearch && matchesAction;
  });

  /* ================= TABLE COLUMNS ================= */

  const columns: Column<HistoryRow>[] = [
    {
      key: "date",
      header: "Date",
      accessor: "date",
      width: "15%",
    },
    {
      key: "productName",
      header: "Product",
      accessor: "productName",
      width: "15%",
    },
    {
      key: "action",
      header: "Action",
      accessor: "action",
      width: "10%",
      render: (v) => (
        <Badge color={v === "add" ? "green" : "red"} variant="soft">
          {v === "add" ? "Added" : "Removed"}
        </Badge>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      accessor: "quantity",
      width: "10%",
      render: (v, row) => (
        <Text weight="medium" color={row.action === "add" ? "green" : "red"}>
          {row.action === "add" ? "+" : "-"}
          {v}
        </Text>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      accessor: "reason",
      width: "15%",
      render: (v) => (
        <Text style={{ textTransform: "capitalize" }}>{v}</Text>
      ),
    },
    {
      key: "referenceNo",
      header: "Reference",
      accessor: "referenceNo",
      width: "15%",
      render: (v) => <Text color="gray">{v || "-"}</Text>,
    },
    {
      key: "notes",
      header: "Notes",
      accessor: "notes",
      width: "20%",
      render: (v) => (
        <Text color="gray" style={{ fontSize: "13px" }}>
          {v || "-"}
        </Text>
      ),
    },
  ];

  return (
    <Flex direction="column" gap="4">
      {/* ===== HEADER ===== */}
      <Flex justify="between" align="center">
        <Text weight="bold" size="6">
          Stock History
        </Text>
        <Text size="2" color="gray">
          Total Records: {filteredHistory.length}
        </Text>
      </Flex>

      {/* ===== FILTER BAR ===== */}
      <Flex align="center" gap="3">
        <Searchbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          placeholder="Search by product, reason, or reference..."
        />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {actionFilter}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {["All Actions", "Added", "Removed"].map((item) => (
              <DropdownMenu.Item
                key={item}
                onClick={() => setActionFilter(item)}
              >
                {item}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      {/* ===== TABLE ===== */}
      {filteredHistory.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          style={{
            height: "300px",
            border: "1px dashed var(--gray-a6)",
            borderRadius: "8px",
          }}
        >
          <Text size="4" color="gray">
            {searchValue || actionFilter !== "All Actions"
              ? "No matching history found"
              : "No stock history available"}
          </Text>
        </Flex>
      ) : (
        <Table
          data={filteredHistory}
          columns={columns}
          emptyMessage="No history found"
          hoverable
          striped
        />
      )}
    </Flex>
  );
}