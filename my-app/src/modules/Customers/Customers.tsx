import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import {
  Flex,
  Text,
  Avatar,
  DropdownMenu,
  Button,
  Dialog,
  IconButton,
} from "@radix-ui/themes";

import {
  DotsVerticalIcon,
  EnvelopeClosedIcon,
  MobileIcon,
} from "@radix-ui/react-icons";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import Table, { Column } from "../../components/dynamicComponents/Table";
import AddCustomer from "./AddCustomer";

/* ================= TYPES ================= */

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  purchases: number;
  totalSpent: number;
  loyaltyPoints: number;
};

/* ================= DATA ================= */

const customers: Customer[] = [
  {
    id: 1,
    name: "Raju Barua",
    phone: "9876543214",
    email: "raju@email.com",
    purchases: 20,
    totalSpent: 4500,
    loyaltyPoints: 450,
  },
  {
    id: 2,
    name: "Sneha Borah",
    phone: "9876543213",
    email: "sneha@email.com",
    purchases: 5,
    totalSpent: 890,
    loyaltyPoints: 89,
  },
  {
    id: 3,
    name: "Amit Kumar",
    phone: "9876543212",
    email: "amit@email.com",
    purchases: 15,
    totalSpent: 3200,
    loyaltyPoints: 320,
  },
];

/* ================= COMPONENT ================= */

export default function Customers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [search, setSearch] = React.useState("");

  const isAdd = location.pathname.endsWith("/add-customer");
  const isEdit = location.pathname.includes("/edit-customer/");
  const isDialogOpen = isAdd || isEdit;

  const customerToEdit = customers.find(
    (c) => c.id === Number(id)
  );

  /* ================= FILTER ================= */

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= TABLE ================= */

  const columns: Column<Customer>[] = [
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
          <Flex align="center" gap="2">
            <EnvelopeClosedIcon />
            <Text size="2" color="gray">
              {row.email}
            </Text>
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
                          onClick={() => console.log("Delete customer:", row.id)}
                        >
                          <Trash2 size={14} /> Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <>
      <Flex direction="column" gap="5" width="100%">
        {/* ===== PAGE TITLE ===== */}
        <Text size="5" weight="bold">
          Customers
        </Text>

        {/* ===== SUMMARY ===== */}
        <div className="kb-summary-row">
          <SummaryCard
            title="Total Customers"
            value={String(customers.length)}
            accentColor="#2962FF"
            softColor="#E3F2FD"
            icon="👥"
          />
          <SummaryCard
            title="Total Purchases"
            value={String(customers.reduce((s, c) => s + c.purchases, 0))}
            accentColor="#00C853"
            softColor="#E5F9EE"
            icon="🛒"
          />
          <SummaryCard
            title="Revenue"
            value={`₹${customers
              .reduce((s, c) => s + c.totalSpent, 0)
              .toLocaleString()}`}
            accentColor="#FF9100"
            softColor="#FFF3E0"
            icon="₹"
          />
        </div>

        {/* ===== TOOLBAR (FULL WIDTH FIXED) ===== */}
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
            <Plus size={16} /> Add Customer
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
            mode={isEdit ? "edit" : "create"}
            initialValues={isEdit ? customerToEdit : undefined}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
