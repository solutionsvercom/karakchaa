import {
  Card,
  Flex,
  Text,
  Badge,
  IconButton,
  Box,
} from "@radix-ui/themes";
import { DropdownMenu } from "@radix-ui/themes";
import { Button } from "@radix-ui/themes";
import { DotsVerticalIcon, CubeIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";



/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "other";

type ProductCardProps = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: Category;
  image?: string;
};

/* -------- CATEGORY → COLOR MAP -------- */

const categoryColorMap: Record<
  Category,
  "amber" | "pink" | "blue" | "green" | "gray"
> = {
  snacks: "amber",
  desserts: "pink",
  beverages: "blue",
  meals: "green",
  other: "gray",
};

/* -------- HELPERS -------- */

const formatLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/* ---------------- COMPONENT ---------------- */

export default function ProductCard({
  name,
  sku,
  price,
  stock,
  category,
  image,
}: ProductCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const safeCategory: Category =
    category && categoryColorMap[category] ? category : "other";

  const lowStock = stock <= 5;

  return (
    <Card
      className="product-card"
      style={{
        padding: 0,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        width: 260,
        background: "white",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* MENU */}
     <DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <IconButton
      variant="soft"
      radius="full"
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        background: "white",
      }}
    >
      <DotsVerticalIcon />
    </IconButton>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content align="end">
   <DropdownMenu.Item onSelect={() => setEditOpen(true)}>
               <Button>Edit</Button>
             </DropdownMenu.Item>
    <DropdownMenu.Item color="red">
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
  <Dialog.Portal>
    <Dialog.Overlay
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
      }}
    />

    <Dialog.Content
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: 24,
        borderRadius: 12,
        width: 520,
        zIndex: 1000,
      }}
    >
      <Dialog.Title>Edit Product</Dialog.Title>

      {/* ✅ THIS IS YOUR FORM */}
      

    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>




      {/* IMAGE */}
      <Box
        className="product-card-image"
        style={{
          height: 170,
          background: "linear-gradient(180deg, #f8fafc, #f1f5f9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <CubeIcon
            className="product-card-icon"
            width={54}
            height={54}
            color="#cbd5e1"
          />
        )}
      </Box>

      {/* CONTENT */}
      <Flex direction="column" gap="3" p="3">
        {/* NAME + PRICE */}
        <Flex justify="between" align="start">
          <Flex direction="column" gap="1">
            <Text weight="medium" size="3">
              {name}
            </Text>
            <Text size="1" color="gray">
              SKU: {sku}
            </Text>
          </Flex>

          <Text weight="bold" size="3" color="violet">
            ₹{price}
          </Text>
        </Flex>

        {/* CATEGORY + STOCK */}
        <Flex justify="between" align="center">
          <Badge
            radius="full"
            variant="soft"
            color={categoryColorMap[safeCategory]}
          >
            {formatLabel(safeCategory)}
          </Badge>

          <Text size="2" color={lowStock ? "red" : "gray"}>
            {lowStock ? "Low stock" : "Stock"}: {stock}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
