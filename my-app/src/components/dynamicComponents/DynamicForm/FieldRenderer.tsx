import {
  TextField,
  TextArea,
  Select,
  Switch,
} from "@radix-ui/themes";
import { FormField } from "./types";
import { DatePicker } from "./DatePicker";
import "./DatePicker.css";


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
  return <DatePicker value={value} onChange={onChange} />;
  
  case "button-group":
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: field.options && field.options.length <= 4 
          ? `repeat(${field.options.length}, 1fr)` 
          : "repeat(3, 1fr)",
        gap: 8,
      }}
    >
      {field.options?.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            padding: "10px 12px",
            border: "none",
            borderRadius: 6,
            background: value === option.value ? "var(--violet-9)" : "var(--gray-a3)",
            color: value === option.value ? "white" : "var(--gray-12)",
            fontWeight: 500,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
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
