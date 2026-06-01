import {
  TextField,
  TextArea,
  Select,
  Switch,
} from "@radix-ui/themes";
import { FormField } from "./types";
import { DatePicker } from "./DatePicker";
import "./DatePicker.css";
import { safeImageSrc } from "../../../utils/imageUrl";

type Props<T extends string> = {
  field: FormField<T>;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
};

/* 
   HELPER: compress image before upload
   Resizes to max 800px wide, 80% JPEG quality
   Typical reduction: 2MB photo → ~150KB
 */
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            }));
          } else {
            resolve(file); // fallback: use original if compression fails
          }
        },
        "image/jpeg",
        0.8 // 80% quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback: use original
    };

    img.src = objectUrl;
  });
}

const FieldRenderer = <T extends string>({
  field,
  value,
  onChange,
  disabled,
}: Props<T>) => {
  const id = field.name;

  switch (field.type) {

    case "number":
      return (
        <input
          type="number"
          min={0}
          disabled={disabled}
          value={value === 0 ? "" : value}
          placeholder={disabled ? "Managed via Stock Management" : "0"}
          onKeyDown={(e) => {
            if (disabled) { e.preventDefault(); return; }
            if (e.key === "-" || e.key === "e") e.preventDefault();
          }}
          onChange={(e) => {
            if (disabled) return;
            let val = e.target.value;
            if (val === "") { onChange(0); }
            else {
              const num = Number(val);
              onChange(num < 0 ? 0 : num);
            }
          }}
          onBlur={() => {
            if (disabled) return;
            if (value === "" || value === null || value < 0) onChange(0);
          }}
          style={{
            width: "100%",
            height: 35,
            border: "1px solid #e5e7eb",
            background: disabled ? "var(--gray-a3)" : "transparent",
            borderRadius: 10,
            padding: "0 12px",
            fontSize: 14,
            outline: "none",
            cursor: disabled ? "not-allowed" : "text",
            color: disabled ? "var(--gray-9)" : "inherit",
          }}
        />
      );

    case "password":
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
          style={{ height: 35, fontSize: 13 }}
        >
          {field.suffix && (
            <TextField.Slot side="right">
              {field.suffix}
            </TextField.Slot>
          )}
        </TextField.Root>
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
          <Select.Content
            position="popper"
            sideOffset={4}
            side="bottom"
            avoidCollisions={false}
            style={{ width: "var(--radix-select-trigger-width)" }}
          >
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
            gridTemplateColumns:
              field.options && field.options.length <= 4
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
                background:
                  value === option.value ? "var(--violet-9)" : "var(--gray-a3)",
                color:
                  value === option.value ? "white" : "var(--gray-12)",
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

    case "file": {
      const imageUrl =
        typeof value === "string" && value !== ""
          ? safeImageSrc(value)
          : value instanceof File
          ? URL.createObjectURL(value)
          : null;

      // Shared hidden file input with compression on change
      const fileInput = (
        <input
          id={id}
          type="file"
          hidden
          accept="image/*"
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            const compressed = await compressImage(file); // compress before storing
            onChange(compressed);
          }}
        />
      );

      // NO IMAGE: clickable upload box 
      if (!imageUrl) {
        return (
          <>
            {fileInput}
            <label
              htmlFor={id}
              style={{
                border: "1.5px dashed #c7c7d1",
                borderRadius: 10,
                width: 90,
                height: 90,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#6b7280",
                gap: 4,
              }}
            >
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
              <span style={{ fontSize: 11 }}>Upload</span>
            </label>
          </>
        );
      }

      //  HAS IMAGE: thumbnail + Change / View / Remove beside it 
      return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {fileInput}

          {/* Thumbnail */}
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              width: 90,
              height: 90,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Buttons stacked vertically beside the image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              justifyContent: "center",
              height: 90,
            }}
          >
            {/* CHANGE */}
            <label
              htmlFor={id}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: "var(--gray-2)",
                color: "var(--gray-12)",
                whiteSpace: "nowrap",
                userSelect: "none",
                textAlign: "center",
              }}
            >
              Change
            </label>

            {/* VIEW */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: "var(--gray-2)",
                color: "var(--gray-12)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              View
            </a>

            {/* REMOVE */}
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #fecaca",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: "#fee2e2",
                color: "#991b1b",
                whiteSpace: "nowrap",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

export default FieldRenderer;