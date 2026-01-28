import React from "react";
import { Search, UserPlus, X } from "lucide-react";

import Form, { FormField } from "../../components/dynamicComponents/Form";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";
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

/* ---------- FORM FIELDS ---------- */
const customerFields: FormField[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter address",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes...",
  },
];

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

/* ---------- STATIC DATA (TEMP) ---------- */
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

/* ---------- TABLE COLUMNS ---------- */
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
    align: "center",
  },
  {
    key: "totalSpent",
    header: "Total Spent",
    align: "center",
    render: (_, row) => (
      <Text weight="medium" color="green">
        ₹{row.totalSpent.toLocaleString()}
      </Text>
    ),
  },
  {
    key: "loyaltyPoints",
    header: "Loyalty Points",
    align: "center",
    render: (_, row) => (
      <Text weight="medium" color="orange">
        {row.loyaltyPoints}
      </Text>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    align: "center",
    render: () => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger >
          <Button variant="ghost" size="1">
            <DotsVerticalIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end">
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
  },
];

/* ---------- MAIN COMPONENT ---------- */
export default function Customers() {
  const handleCreateCustomer = async () => {
    console.log("Create confirmed");
  };

  return (
  <Flex direction="column" gap="5" width="100%">
    {/* ---------- STATS ROW ---------- */}
    <Flex gap="4">
      <Flex
        direction="column"
        justify="center"
        style={{
          flex: 1,
          background: "#7c4dff",
          color: "white",
          padding: "20px",
          borderRadius: 12,
        }}
      >
        <Text size="2">Total Customers</Text>
        <Text size="6" weight="bold">
          {customers.length}
        </Text>
      </Flex>

      <Flex
        direction="column"
        justify="center"
        style={{
          flex: 1,
          background: "white",
          padding: "20px",
          borderRadius: 12,
          border: "1px solid #eee",
        }}
      >
        <Text size="2" color="gray">
          Total Revenue
        </Text>
        <Text size="6" weight="bold">
          ₹12,720
        </Text>
      </Flex>

      <Flex
        direction="column"
        justify="center"
        style={{
          flex: 1,
          background: "white",
          padding: "20px",
          borderRadius: 12,
          border: "1px solid #eee",
        }}
      >
        <Text size="2" color="gray">
          Avg per Customer
        </Text>
        <Text size="6" weight="bold">
          ₹2,120
        </Text>
      </Flex>
    </Flex>

    {/* ---------- TOOLBAR ---------- */}
    <Flex justify="between" align="center">
      {/* Search */}
      <Flex
        align="center"
        gap="2"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "6px 10px",
          width: 300,
          background: "white",
        }}
      >
        <Search size={16} />
        <input
          placeholder="Search customers..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: 14,
          }}
        />
      </Flex>

      {/* Add Customer */}
      <Dialog.Root>
  <Dialog.Trigger>
    <Button>
      + Add Customer
    </Button>
  </Dialog.Trigger>

  <Dialog.Content maxWidth="420px">
    {/* Header */}
    <Flex justify="between" align="center" mb="4">
      <Text weight="bold" size="4">
        Add New Customer
      </Text>

      <Dialog.Close>
        <Button variant="ghost">✕</Button>
      </Dialog.Close>
    </Flex>

    {/* ✅ FORM (this is the key line you were missing) */}
    <Form fields={customerFields} />

    {/* Actions */}
    <Flex mt="4" gap="3">
      <Dialog.Close>
        <Button variant="outline" style={{ flex: 1 }}>
          Cancel
        </Button>
      </Dialog.Close>

      {/* ✅ ALERT DIALOG WRAPPING CREATE BUTTON */}
      <DynamicAlertDialog
        title="Are you sure?"
        description="This action cannot be undone."
        actionText="Yes Create"
        cancelText="No go back"
        onAction={handleCreateCustomer}
      >
        <Button style={{ flex: 1 }}>
          Create
        </Button>
      </DynamicAlertDialog>
    </Flex>
  </Dialog.Content>
</Dialog.Root>

    </Flex>

    {/* ---------- TABLE ---------- */}
    <Table
      data={customers}
      columns={columns}
      striped
      hoverable
    />
  </Flex>
);

}
