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
};

const DynamicAlertDialog = ({
  children,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Confirm",
  onAction,
  color = "green",
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

  return (
    <AlertDialog.Root>
      {/*  custom trigger without asChild */}
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
