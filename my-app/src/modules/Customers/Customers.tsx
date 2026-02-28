import React, { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Plus, Trash2, Pencil, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers, fetchCustomerStats, deleteCustomer, Customer } from "../../features/CustomersSlice";
import { RootState, AppDispatch } from "../../store/Store";

import {
  Users,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";

import {
  Flex,
  Text,
  Avatar,
  IconButton,
  DropdownMenu,
  Button,
  Dialog,
} from "@radix-ui/themes";

import {
  MobileIcon,
} from "@radix-ui/react-icons";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddCustomer from "./AddCustomer";

/* ================= TYPES ================= */

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  purchases: number;
  totalSpent: number;
  loyaltyPoints: number;
};

/* ================= COMPONENT ================= */

export default function Customers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const isAdd = location.pathname.endsWith("/add-customer");
  const isEdit = location.pathname.endsWith("/edit-customer");
  const isDialogOpen = isAdd || isEdit;

  const dispatch = useDispatch<AppDispatch>();

  const { customers, stats, loading } = useSelector(
    (state: RootState) => state.customer
  );

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchCustomerStats());
  }, [dispatch]);

  const customerToEdit = customers.find((c) => c._id === id);

  const formattedCustomers: CustomerRow[] = customers?.map((c) => ({
    id: c?._id || "",
    name: c?.fullName || "",
    phone: c?.phoneNumber || "",
    purchases: c?.totalPurchases || 0,
    totalSpent: c?.totalSpent || 0,
    loyaltyPoints: c?.points || 0,
  })) || [];

  /* ================= FILTER ================= */

  const filteredCustomers = formattedCustomers.filter((c) =>
    `${c.name} ${c.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= TABLE ================= */

  const columns: Column<CustomerRow>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (_, row) => (
        <Flex align="center" gap="3">
          <Avatar fallback={row.name[0]} radius="full" />
          <Text weight="medium">{row.name}</Text>
        </Flex>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (_, row) => (
        <Flex direction="column" gap="1">
          <Flex align="center" gap="2">
            <MobileIcon />
            <Text size="2">{row.phone}</Text>
          </Flex>
        </Flex>
      ),
    },
    {
      key: "purchases",
      header: "Purchases",
      accessor: "purchases",
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (_, row) => (
        <Text weight="medium" color="green">
          ₹{row.totalSpent.toLocaleString()}
        </Text>
      ),
    },
    {
      key: "loyaltyPoints",
      header: "Points",
      accessor: "loyaltyPoints",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="soft" radius="full">
              <MoreVertical size={16} />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onClick={() =>
                navigate(`/dashboard/customer/${row.id}/edit-customer`)
              }
            >
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => setDeleteId(row.id)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <>
      <Flex direction="column" gap="5" width="100%">

        {/* ===== SUMMARY ===== */}
        <div className="kb-summary-row">
          <SummaryCard
            title="Total Customers"
            value={(stats?.totalCustomers || 0).toString()}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon={<Users size={20}  /> as any}
          />

          <SummaryCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon={<ShoppingCart size={20}  /> as any}
          />

          <SummaryCard
            title="Avg per Customer"
            value={`₹${
              stats?.totalCustomers
                ? Math.floor(stats.totalRevenue / stats.totalCustomers).toLocaleString()
                : "0"
            }`}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon={<IndianRupee size={20}  /> as any}
          />
        </div>

        {/* ===== TOOLBAR ===== */}
        <Flex align="center" gap="3" width="100%">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={search}
              onSearchChange={setSearch}
              placeholder="Search customers..."
            />
          </div>
          <Button
            style={{ whiteSpace: "nowrap" }}
            onClick={() => navigate("/dashboard/customer/add-customer")}
          >
            + Add Customer
          </Button>
        </Flex>

        {/* ===== TABLE ===== */}
        <Table
          data={filteredCustomers}
          columns={columns}
          emptyMessage="No customers found"
          hoverable
          striped
        />
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/customer");
        }}
      >
        <Dialog.Content maxWidth="420px">
          <AddCustomer
            key={customerToEdit?._id || "create"}
            mode={isEdit ? "edit" : "create"}
            customerId={customerToEdit?._id}
            initialValues={
              customerToEdit
                ? {
                    name: customerToEdit.fullName,
                    phone: customerToEdit.phoneNumber,
                    address: customerToEdit.address || "",
                    notes: customerToEdit.notes || "",
                  }
                : undefined
            }
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* ===== DELETE CONFIRM DIALOG ===== */}
      <Dialog.Root
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Customer?</Dialog.Title>

          <p style={{ fontSize: 14, color: "#6b7280" }}>
            This action cannot be undone. Are you sure you want to delete this customer?
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
                  await dispatch(deleteCustomer(deleteId)).unwrap();
                  dispatch(fetchCustomerStats());
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}