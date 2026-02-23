import {
  Flex,
  Text,
  Badge,
  IconButton,
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
  variant?: "default" | "pos";
  onAdd?: () => void;
  isActive?: boolean;
  onToggleActive?: (value: boolean) => void;
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
    /* ✅ Plain div — no Radix Card, so no Radix styles can override our layout */
    <div
      className="product-card"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        width: "100%",
        background: "var(--gray-1)",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        border: "1px solid var(--gray-4)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        /* ✅ CRITICAL: plain div defaults to display:block which stacks
           children naturally — image on top, content below, always visible */
        display: "flex",
        flexDirection: "column",
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
              <DropdownMenu.Item onSelect={() => onToggleActive(!isActive)}>
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
      <div className="product-card-img">
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <CubeIcon width={48} height={48} color="#cbd5e1" />
        )}
      </div>

      {/* CONTENT */}
      <div className="product-card-body">
        <span
          style={{
            fontWeight: 500,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--gray-12)",
          }}
        >
          {name}
        </span>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-12)" }}>
            ₹{price}
          </span>

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
        </div>

        {!isPOS && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge radius="full" variant="soft" color={categoryColorMap[safeCategory]}>
              {formatLabel(safeCategory)}
            </Badge>
            <span style={{ fontSize: 12, color: lowStock ? "var(--red-9)" : "var(--gray-10)" }}>
              {lowStock ? "Low" : "Stock"}: {stock}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}