import React, { useState } from "react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";

type DynamicAlertDialogProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onAction?: () => Promise<void> | void;
  color?: "red" | "blue" | "green" | "gray";
  // ✅ Controlled mode — used by DynamicForm to block opening until validation passes
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DynamicAlertDialog = ({
  children,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Confirm",
  onAction,
  color = "green",
  open,
  onOpenChange,
}: DynamicAlertDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onAction?.();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use controlled props only when both are provided
  const controlledProps =
    open !== undefined && onOpenChange !== undefined
      ? { open, onOpenChange }
      : {};

  return (
    <AlertDialog.Root {...controlledProps}>
      {/* ✅ No asChild — @radix-ui/themes AlertDialog.Trigger doesn't support it */}
      <AlertDialog.Trigger>
        {children}
      </AlertDialog.Trigger>

      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title}</AlertDialog.Title>

        <AlertDialog.Description size="2">
          {description}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" disabled={loading}>
              {cancelText}
            </Button>
          </AlertDialog.Cancel>

          <AlertDialog.Action>
            <Button
              variant="solid"
              color={color}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : actionText}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export default DynamicAlertDialog;