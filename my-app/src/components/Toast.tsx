import React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "success" | "error" | "info";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = "success",
  open,
  onOpenChange,
}) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <AlertCircle size={20} />,
  };

  const colors = {
    success: {
      bg: "#dcfce7",
      border: "#22c55e",
      text: "#166534",
      icon: "#22c55e",
    },
    error: {
      bg: "#fee2e2",
      border: "#ef4444",
      text: "#991b1b",
      icon: "#ef4444",
    },
    info: {
      bg: "#dbeafe",
      border: "#3b82f6",
      text: "#1e40af",
      icon: "#3b82f6",
    },
  };

  const colorScheme = colors[variant];

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      style={{
        background: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ color: colorScheme.icon, flexShrink: 0 }}>
        {icons[variant]}
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <ToastPrimitive.Title
            style={{
              margin: 0,
              color: colorScheme.text,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {title}
          </ToastPrimitive.Title>
        )}
        {description && (
          <ToastPrimitive.Description
            style={{
              margin: 0,
              color: colorScheme.text,
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {description}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close
        style={{
          background: "transparent",
          border: "none",
          color: colorScheme.text,
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
        }}
      >
        <X size={16} />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = () => (
  <ToastPrimitive.Viewport
    style={{
      position: "fixed",
      top: 16,
      right: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      width: "auto",
      maxWidth: "100vw",
      margin: 0,
      listStyle: "none",
      zIndex: 2000,
      outline: "none",
    }}
  />
);
