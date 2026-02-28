export type FormField<T extends string> = {
  name: T;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "switch"
    | "date"
    | "file"
    | "button-group";
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2;
  group?: "triple";
  rows?: number;
  options?: { label: string; value: string }[];
  suffix?: React.ReactNode;
  disabled?: boolean; // ✅ locks the field visually and functionally
};