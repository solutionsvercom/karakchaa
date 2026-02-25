import { Button, Flex, Text, IconButton, TextField } from "@radix-ui/themes";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCart } from "./CartContext";
import { RootState } from "../../store/Store";

interface CartProps {
  onCheckout?: () => void;
}

const Cart = ({ onCheckout }: CartProps) => {
  const { items, total, increment, decrement, removeItem, clearCart } = useCart();
  const { products } = useSelector((state: RootState) => state.product);

  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();
  const discountedTotal = Math.max(total - discount, 0);

  const handleCheckout = () => {
    onCheckout?.();
    navigate("/dashboard/pos/create-sale");
  };

  return (
    <Flex direction="column" style={{ height: "100%" }} p="4" gap="3">
      <Flex justify="between" align="center">
        <Flex align="center" gap="2">
          <Flex
            align="center"
            justify="center"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--accent-9)",
              color: "white",
              fontWeight: 600,
            }}
          >
            {items.length}
          </Flex>
          <Text size="4" weight="bold">
            Current Order
          </Text>
        </Flex>

        {items.length > 0 && (
          <Button variant="ghost" color="red" onClick={clearCart}>
            Clear
          </Button>
        )}
      </Flex>

      <Flex
        direction="column"
        gap="3"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {items.length === 0 && (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Text color="gray">Cart is empty</Text>
          </Flex>
        )}

        {items.map((item) => {
          const product = products.find((p: any) => p._id === item.id);
          const maxQty = typeof product?.stockQty === "number" ? product.stockQty : undefined;
          const canIncrease = typeof maxQty === "number" ? item.quantity < maxQty : true;

          return (
            <Flex
              key={item.id}
              direction="column"
              gap="2"
              style={{
                background: "var(--gray-2)",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Flex justify="between" align="center">
                <div>
                  <Text weight="medium">{item.name}</Text>
                  <Text size="2" color="gray">
                    Rs {item.price} each
                  </Text>
                </div>
                <IconButton
                  size="1"
                  color="red"
                  variant="soft"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <IconButton size="1" variant="soft" onClick={() => decrement(item.id)}>
                    <Minus size={14} />
                  </IconButton>
                  <Text>{item.quantity}</Text>
                  <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => increment(item.id, maxQty)}
                    disabled={!canIncrease}
                    title={!canIncrease ? "Out of stock" : "Increase quantity"}
                  >
                    <Plus size={14} />
                  </IconButton>
                </Flex>
                <Text weight="bold">Rs {item.price * item.quantity}</Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>

      {items.length > 0 && (
        <Flex direction="column" gap="3" style={{ flexShrink: 0 }}>
          <Flex direction="column" gap="2">
            <Flex justify="between">
              <Text color="gray">Subtotal</Text>
              <Text>Rs {total}</Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text color="gray">Discount</Text>
              <TextField.Root
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{ width: 90 }}
              />
            </Flex>

            <Flex justify="between" mt="1">
              <Text size="4" weight="bold">
                Total
              </Text>
              <Text size="5" weight="bold" color="violet">
                Rs {discountedTotal}
              </Text>
            </Flex>
          </Flex>

          <Button size="4" onClick={handleCheckout}>
            Checkout · Rs {discountedTotal}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default Cart;
