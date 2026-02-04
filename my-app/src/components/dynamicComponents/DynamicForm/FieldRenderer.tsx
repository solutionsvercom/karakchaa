import {
  TextField,
  TextArea,
  Select,
  Switch,
} from "@radix-ui/themes";
import { FormField } from "./types";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import "react-day-picker/style.css";



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
    <input
      type="number"
      value={value === 0 ? "" : value}
      placeholder="0"
      onChange={(e) => {
        const val = e.target.value;

        // empty → treat as 0
        if (val === "") {
          onChange(0);
        } else {
          onChange(Number(val));
        }
      }}
      onBlur={() => {
        // when user leaves field empty, reset to 0
        if (value === "" || value === null) {
          onChange(0);
        }
      }}
      style={{
        width: "100%",
        height: 35,
        border: "1px solid #e5e7eb",
        background: "transparent",
        borderRadius: 10,
        padding: "0 12px",
        fontSize: 14,
        outline: "none",
      }}
    />
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
    height: 35,         
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
          width: "100%",
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
  case "date":
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          style={{
            width: "100%",
            height: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: value ? "#111827" : "#9ca3af",
            }}
          >
            {value ? format(value, "dd-MMM-yyyy") : "Select date"}
          </span>

          <CalendarIcon size={16} color="#6b7280" />
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        avoidCollisions={false}
        style={{
          background: "var(--color-panel)", // Radix theme token
          borderRadius: 12,
          padding: 0,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <DayPicker
  mode="single"
  selected={value instanceof Date ? value : undefined}
  onSelect={(date) => {
    if (!date) return;
    onChange(date);          // ✅ store selected date
  }}
/>



        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={() => onChange(undefined)}
            style={{
              fontSize: 12,
              color: "#2563eb",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => onChange(new Date())}
            style={{
              fontSize: 12,
              color: "#2563eb",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Today
          </button>
        </div>
      </Popover.Content>
    </Popover.Root>
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
