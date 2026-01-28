import React from "react";
import Table, { Column } from "../../components/dynamicComponents/Table";
import {
  Flex,
  Text,
  Avatar,
  DropdownMenu,
  Button,
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

/* ---------- DATA ---------- */
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

/* ---------- COLUMNS ---------- */
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
    render: (_, row) => (
      <Text weight="medium" color="green">
        ₹{row.totalSpent.toLocaleString()}
      </Text>
    ),
    align: "center",
  },
  {
    key: "loyaltyPoints",
    header: "Loyalty Points",
    render: (_, row) => (
      <Text weight="medium" color="orange">
        {row.loyaltyPoints}
      </Text>
    ),
    align: "center",
  },
  {
    key: "actions",
    header: "Actions",
    align: "center",
    render: () => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
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

/* ---------- COMPONENT ---------- */
const Customers = () => {
  return <Table data={customers} columns={columns} striped hoverable />;
};

export default Customers;
