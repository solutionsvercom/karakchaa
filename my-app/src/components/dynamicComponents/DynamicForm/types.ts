export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "switch"
  | "file";

export type Option = {
  label: string;
  value: string;
};

export type FormField<T extends string = string> = {
  name: T;
  label: string;
  type: FieldType;

  placeholder?: string;
  required?: boolean;
  options?: Option[];
  rows?: number;

  span?: 1 | 2; // 1 = half width, 2 = full width
   compact?: boolean;
  group?: "triple";
};
