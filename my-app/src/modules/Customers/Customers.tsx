import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import Searchbar from "../../components/dynamicComponents/Searchbar";
import { SummaryCard } from "../../components/dynamicComponents/Cards";
import AddCustomer from "./AddCustomer";
import Table, { Column } from "../../components/dynamicComponents/Table";

import {
  Flex,
  Text,
  Avatar,
  DropdownMenu,
  Button,
  Dialog,
} from "@radix-ui/themes";

import {
  DotsVerticalIcon,
  EnvelopeClosedIcon,
  MobileIcon,
} from "@radix-ui/react-icons";

/* ---------- CUSTOMER TYPE ---------- */
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  purchases: number;
  totalSpent: number;
  loyaltyPoints: number;
}

/* ---------- STATIC DATA ---------- */
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
  {
    id: 4,
    name: "Rahul Sharma",
    phone: "9876543211",
    email: "rahul@email.com",
    purchases: 12,
    totalSpent: 2450,
    loyaltyPoints: 245,
  },
  {
    id: 5,
    name: "Priya Das",
    phone: "9876543210",
    email: "priya@email.com",
    purchases: 8,
    totalSpent: 1680,
    loyaltyPoints: 168,
  },
];

/* ---------- MAIN COMPONENT ---------- */
export default function Customers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [searchValue, setSearchValue] = React.useState("");

  const isAddMode = location.pathname.endsWith("/add-customer");
  const isEditMode = location.pathname.endsWith("/edit-customer");
  const isDialogOpen = isAddMode || isEditMode;

  const customerToEdit = customers.find(
    (c) => c.id === Number(id)
  );

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    customer.phone.includes(searchValue) ||
    customer.email.toLowerCase().includes(searchValue.toLowerCase())
  );

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
      header: "Loyalty Points",
      render: (_, row) => (
        <Text weight="medium" color="orange">
          {row.loyaltyPoints}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" radius="full">
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              onClick={() =>
                navigate(`/dashboard/customer/${row.id}/edit-customer`)
              }
            >
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    },
  ];

  return (
    <Flex direction="column" gap="5" width="100%">
      {/* ---------- STATS ---------- */}
      <section className="kb-summary-row">
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
          title="Total Revenue"
          value={`₹${customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}`}
          accentColor="#FF9100"
          softColor="#FFF3E0"
          icon="₹"
        />
      </section>

      {/* ---------- TOOLBAR (FIXED) ---------- */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid var(--gray-6)",
          background: "var(--gray-1)",
        }}
      >
        <Flex align="center" gap="3">
          <Flex style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              placeholder="Search by name, phone or email..."
            />
          </Flex>

          <Button
            style={{ whiteSpace: "nowrap" }}
            onClick={() => navigate("/dashboard/customer/add-customer")}
          >
            + Add Customer
          </Button>
        </Flex>
      </div>

      {/* ---------- DIALOG ---------- */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) navigate("/dashboard/customer");
        }}
      >
        <Dialog.Content maxWidth="420px">
          <AddCustomer
            mode={isEditMode ? "edit" : "create"}
            initialValues={isEditMode ? customerToEdit : undefined}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* ---------- TABLE ---------- */}
      <Table
        data={filteredCustomers}
        columns={columns}
        striped
        hoverable
      />
    </Flex>
  );
}
