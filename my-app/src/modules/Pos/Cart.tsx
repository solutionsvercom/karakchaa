import { Button, Flex, Text, IconButton, TextField } from "@radix-ui/themes";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { useState } from "react";
import { CheckoutDialog } from "./CheckoutDialog"; // 👈 ADD THIS

const Cart = () => {
  const { items, total, increment, decrement, removeItem, clearCart } = useCart();
  const [discount, setDiscount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false); // 👈 ADD THIS

  const discountedTotal = Math.max(total - discount, 0);

  return (
    <>
      <Flex direction="column" style={{ height: "100%" }} p="4" gap="3">
        {/* ================= HEADER (FIXED) ================= */}
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

        {/* ================= ITEMS (SCROLL AREA) ================= */}
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

          {items.map((item) => (
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
                    ₹{item.price} each
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

                  <IconButton size="1" variant="soft" onClick={() => increment(item.id)}>
                    <Plus size={14} />
                  </IconButton>
                </Flex>

                <Text weight="bold">₹{item.price * item.quantity}</Text>
              </Flex>
            </Flex>
          ))}
        </Flex>

        {/* ================= FOOTER (FIXED BOTTOM) ================= */}
        {items.length > 0 && (
          <Flex direction="column" gap="3" style={{ flexShrink: 0 }}>
            {/* SUMMARY */}
            <Flex direction="column" gap="2">
              <Flex justify="between">
                <Text color="gray">Subtotal</Text>
                <Text>₹{total}</Text>
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
                  ₹{discountedTotal}
                </Text>
              </Flex>
            </Flex>

            {/* CHECKOUT - 👇 UPDATED */}
            <Button size="4" onClick={() => setCheckoutOpen(true)}>
              Checkout · ₹{discountedTotal}
            </Button>
          </Flex>
        )}
      </Flex>

      {/* 👇 ADD CHECKOUT DIALOG */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        discount={discount}
      />
    </>
  );
};

export default Cart;