import {
  Card,
  Flex,
  Text,
  Badge,
  IconButton,
  Box,
  DropdownMenu,
  Button,
} from "@radix-ui/themes";
import { DotsVerticalIcon, CubeIcon } from "@radix-ui/react-icons";
import { Pencil, Trash2, Plus } from "lucide-react";


/* ---------------- TYPES ---------------- */

type Category = "snacks" | "desserts" | "beverages" | "meals" | "drinks" | "starters" | "breads" | "pizza" | "sandwich" | "other";

export type ProductCardProps = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: Category;
  image?: string;

  /** POS support */
  variant?: "default" | "pos";
  onAdd?: () => void;

  /** TOGGLE SUPPORT */
  isActive?: boolean;
  onToggleActive?: (value: boolean) => void;

  /** Existing callbacks */
  onEdit?: () => void;
  onDelete?: () => void;
};

/* -------- CATEGORY → COLOR MAP -------- */

const categoryColorMap: Record<
  Category,
  "amber" | "pink" | "blue" | "green" | "gray" | "orange" | "cyan" | "purple" | "red"|"yellow"
> = {
  snacks: "amber",
  desserts: "pink",
  beverages: "blue",
  meals: "green",
  other: "gray",
  drinks:  "orange",
  starters: "yellow",
  breads: "purple",
  pizza: "pink",
  sandwich: "cyan",
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
  variant = "default",
  onAdd,
  isActive = true,
  onToggleActive,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isPOS = variant === "pos";

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
        // ✅ FIXED: removed hardcoded width: 260, now fills grid cell
        width: "100%",
        background: "white",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* MENU (HIDDEN IN POS) */}
      {!isPOS && (
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
                
              }}
            >
              <DotsVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          

          <DropdownMenu.Content align="end">
            {onEdit && (
              <DropdownMenu.Item onSelect={onEdit}>
                <Pencil size={14} /> Edit
              </DropdownMenu.Item>
            )}

            {onToggleActive && (
              <DropdownMenu.Item
                onSelect={() => onToggleActive(!isActive)}
              >
                {isActive ? "Disable Product" : "Enable Product"}
              </DropdownMenu.Item>
            )}

            {onDelete && (
              <DropdownMenu.Item color="red" onSelect={onDelete}>
                <Trash2 size={14} /> Delete
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}

      {/* IMAGE */}
      <Box
        style={{
          // ✅ FIXED: shorter image on mobile via clamp
          height: "clamp(110px, 20vw, 170px)",
          background: "linear-gradient(180deg, #f8fafc, #f1f5f9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <CubeIcon width={54} height={54} color="#cbd5e1" />
        )}
      </Box>

      {/* CONTENT */}
      <Flex direction="column" gap="2" p="3">
        {/* ✅ FIXED: truncate long names so they don't break layout */}
        <Text
          weight="medium"
          size="3"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Text>

        <Flex justify="between" align="center">
          <Text weight="bold" size="4">
            ₹{price}
          </Text>

          {/* POS ADD BUTTON — always visible (not hover-gated) */}
          {isPOS && (
            <IconButton
              radius="full"
              size="3"
              onClick={() => onAdd?.()}
              style={{ flexShrink: 0 }}
            >
              <Plus size={18} />
            </IconButton>
          )}
        </Flex>

        {/* DEFAULT MODE DETAILS */}
        {!isPOS && (
          <Flex justify="between" align="center">
            <Badge
              radius="full"
              variant="soft"
              color={categoryColorMap[safeCategory]}
            >
              {formatLabel(safeCategory)}
            </Badge>

            <Text size="2" color={lowStock ? "red" : "gray"}>
              {lowStock ? "Low" : "Stock"}: {stock}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}