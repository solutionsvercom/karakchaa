import {
  TextField,
  TextArea,
  Select,
  Switch,
} from "@radix-ui/themes";
import { FormField } from "./types";

type Props<T extends string> = {
  field: FormField<T>;
  value: any;
  onChange: (value: any) => void;
};

const FieldRenderer = <T extends string>({
  field,
  value,
  onChange,
}: Props<T>) => {
  const id = field.name;

  switch (field.type) {

  case "number":
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #e5e7eb",   // 👈 light border (same as inputs)
        borderRadius: 10,
        height: 35,
        overflow: "hidden",
        
      }}
    >
      {/* Minus */}
      <button
        type="button"
        onClick={() => onChange(Math.max((value ?? 0) - 1, 0))}
        style={{
          width: 32,
          height: "100%",
          border: "none",
          background: "transparent",
          color: "#6b7280",            // 👈 soft gray
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        −
      </button>

      {/* Value */}
      <input
        id={id}
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 44,
          border: "none",
          outline: "none",
          textAlign: "center",
          fontSize: 14,
          color: "#6b7280",            // 👈 normal text
          background: "transparent",
        }}
      />

      {/* Plus */}
      <button
        type="button"
        onClick={() => onChange((value ?? 0) + 1)}
        style={{
          width: 32,
          height: "100%",
          border: "none",
          background: "transparent",
          color: "#6b7280",            // 👈 soft gray
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        +
      </button>
    </div>
  );


  case "text":
  case "email":
      return (
        <TextField.Root
  id={id}
  type={field.type}
  placeholder={field.placeholder}
  value={value ?? ""}
  size="2"
  radius="large"
  variant="surface"
  onChange={(e) => onChange(e.target.value)}
  style={{
    height: 30,         
    fontSize: 13,        
  }}
/>

      );

    case "textarea":
      return (
        <TextArea
        style={{ fontSize: 13, resize: "none" }}
  id={id}
  rows={field.rows ?? 2}
  placeholder={field.placeholder}
  value={value ?? ""}
  size="2"
  radius="large"
  variant="surface"
  onChange={(e) => onChange(e.target.value)}
/>

      );

    case "select":
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id={id}
        placeholder={field.placeholder || "Select"}
        style={{
          width: "95%",
          height: 35,
          padding: "0 12px",
          borderRadius: 10,
        
          
        }}
      />

      <Select.Content>
        {field.options?.map((opt) => (
          <Select.Item key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );



case "switch":
  return (
    <Switch
      checked={Boolean(value)}
      onCheckedChange={onChange}
    />
  );




   case "file":
  return (
    <label
      htmlFor={id}
      style={{
        border: "1.5px dashed #c7c7d1",
        borderRadius: 10,
        width: 90,
        height: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#6b7280",
      }}
    >
      <input
        id={id}
        type="file"
        hidden
        onChange={(e) =>
          onChange(e.currentTarget.files?.[0] ?? null)
        }
      />

      {/* Upload Icon + Text */}
      <div style={{ textAlign: "center", fontSize: 10 }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div style={{ marginTop: 4 }}>Upload</div>
      </div>
    </label>
  );




    default:
      return null;
  }
};

export default FieldRenderer;
