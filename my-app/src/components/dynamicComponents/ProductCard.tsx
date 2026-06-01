import {
  Flex,
  Badge,
  IconButton,
  DropdownMenu,
  Button,
  Switch,
} from "@radix-ui/themes";
import { DotsVerticalIcon, CubeIcon } from "@radix-ui/react-icons";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  badgeColorForCategorySlug,
  formatCategorySlugAsLabel,
} from "../../utils/categoryDisplay";
import { safeImageSrc } from "../../utils/imageUrl";

/*  TYPES  */

export type ProductCardProps = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock?: number;
  /** Stored slug from backend */
  category: string;
  /** Optional display label when slug maps to a managed category */
  categoryDisplay?: string;
  image?: string;
  variant?: "default" | "pos";
  onAdd?: () => void;
  isActive?: boolean;
  onToggleActive?: (value: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

/*  COMPONENT */

export default function ProductCard({
  name,
  sku,
  price,
  stock,
  minStock = 0,
  category,
  categoryDisplay,
  image,
  variant = "default",
  onAdd,
  isActive = true,
  onToggleActive,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isPOS = variant === "pos";
  const imgSrc = safeImageSrc(image);
  const slug = category || "other";
  const badgeLabel =
    categoryDisplay ?? formatCategorySlugAsLabel(slug);
  const badgeColor = badgeColorForCategorySlug(slug);
  const lowStock = stock <= minStock;
  const isOutOfStock = stock <= 0;

  return (
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
        display: "flex",
        flexDirection: "column",
        opacity: isOutOfStock ? 0.8 : 1,
      }}
    >
      {/* OUT OF STOCK OVERLAY */}
      {isOutOfStock && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(1px)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 800,
              borderRadius: 6,
              boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)",
              letterSpacing: "1px",
              border: "2px solid white",
              transform: "rotate(-5deg)",
            }}
          >
            OUT OF STOCK
          </div>
        </div>
      )}

      {/* FLOATING LOW STOCK BADGE (top-right of image) */}
      {/* We moved this into the body below for a cleaner look */}

      {/* IMAGE SECTION */}
      <div
        className="product-card-img"
        style={{
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gray-3)",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            referrerPolicy="no-referrer"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isOutOfStock ? "grayscale(100%) contrast(0.8)" : "none",
            }}
          />
        ) : (
          <CubeIcon width={48} height={48} color="#cbd5e1" />
        )}
      </div>

      {/* CONTENT BODY (WHITE BACKGROUND) */}
      <div className="product-card-body" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* NAME AND MENU ROW */}
        <Flex justify="between" align="center">
          <span style={{
            fontWeight: 600,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--gray-12)",
            maxWidth: "85%"
          }}>
            {name}
          </span>

          {/* THREE DOTS MENU (Moved here to be on white background) */}
          {!isPOS && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  variant="ghost"
                  radius="full"
                  size="1"
                  color="gray"
                  style={{ cursor: "pointer" }}
                >
                  <DotsVerticalIcon />
                </IconButton>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="end">
                {onEdit && <DropdownMenu.Item onSelect={onEdit}><Pencil size={14} /> Edit</DropdownMenu.Item>}
                {onDelete && <DropdownMenu.Item color="red" onSelect={onDelete}><Trash2 size={14} /> Delete</DropdownMenu.Item>}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
        </Flex>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-12)" }}>
              ₹{price}
            </span>
          </div>

          {isPOS && (
            <Button
              radius="full"
              size="2"
              onClick={() => onAdd?.()}
              disabled={isOutOfStock}
              style={{ flexShrink: 0, cursor: isOutOfStock ? "not-allowed" : "pointer", opacity: isOutOfStock ? 0.5 : 1 }}
            >
              <Plus size={16} /> Add
            </Button>
          )}
        </div>

        {!isPOS && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge radius="full" variant="soft" color={badgeColor}>
                {badgeLabel}
              </Badge>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isOutOfStock ? "#dc2626" : lowStock ? "#f59e0b" : "var(--green-11)",
                }}
              >
                {isOutOfStock ? "Out" : lowStock ? "Low" : "Stock"}: {stock}
              </span>
            </div>

            <div
              style={{
                marginTop: 4,
                height: 4,
                background: "var(--gray-4)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: minStock > 0 ? `${Math.min((stock / minStock) * 100, 100)}%` : "100%",
                  background: isOutOfStock ? "#dc2626" : lowStock ? "#f59e0b" : "var(--green-9)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {onToggleActive && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                

                <span
                  style={{
                    fontSize: 11,
                    color: "var(--gray-9)",
                    whiteSpace: "nowrap",
                  }}
                >
                  SKU: {sku}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: isActive ? "var(--green-11)" : "var(--gray-10)",
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <Switch checked={isActive} onCheckedChange={onToggleActive} size="1" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}