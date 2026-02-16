import { useState, useEffect } from "react";
import { Text } from "@radix-ui/themes";
import FieldRenderer from "./FieldRenderer";
import { FormField } from "./types";
import type { ReactNode } from "react";
import { Flex, Button } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import DynamicAlertDialog from "../DynamicAlertDialog";
import { X } from "lucide-react";

type Props<T extends string> = {
  title?: string;
  fields: FormField<T>[];
  onSubmit: (values: Record<T, any>) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  initialValues?: Partial<Record<T, any>>;
  confirm?: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
  };
  onFieldChange?: (fieldName: T, value: any) => void; //  ADD THIS
};

const DynamicForm = <T extends string>({
  title,
  fields,
  onSubmit,
  submitText,
  cancelText,
  onCancel,
  confirm,
  initialValues,
  onFieldChange, //  ADD THIS
}: Props<T>) => {
  const [values, setValues] = useState<Record<T, any>>(
    (initialValues ?? {}) as Record<T, any>
  );

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues as Record<T, any>);
    }
  }, [initialValues]);

  const setValue = (name: T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    //  ADD THIS - Call onFieldChange when value changes
    if (onFieldChange) {
      onFieldChange(name, value);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {/* FORM HEADER */}
      {title && (
        <Flex justify="between" align="center" mb="4">
          <Text weight="bold" size="4">
            {title}
          </Text>

          <Dialog.Close asChild>
            <Button variant="ghost" className="dialog-close-icon">
              <X size={18} />
            </Button>
          </Dialog.Close>
        </Flex>
      )}

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {(() => {
          const elements: ReactNode[] = [];

          let i = 0;

          while (i < fields.length) {
            const field = fields[i];

            /* ============================
               TRIPLE ROW (Product only)
               ============================ */
            if (field.group === "triple") {
              const tripleFields = fields.slice(i, i + 3);

              elements.push(
                <div
                  key={`triple-${field.name}`}
                  style={{
                    gridColumn: "span 2",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  {tripleFields.map((f) => (
                    <div key={f.name}>
                      <Text
                        as="label"
                        htmlFor={f.name}
                        size="2"
                        weight="medium"
                        style={{ marginBottom: 4, display: "block" }}
                      >
                        {f.label}
                        {f.required && <Text color="red"> *</Text>}
                      </Text>

                      <FieldRenderer
                        field={f}
                        value={values[f.name]}
                        onChange={(v) => setValue(f.name, v)}
                      />
                    </div>
                  ))}
                </div>
              );

              i += 3;
              continue;
            }

            /* ============================
               NORMAL FIELD
               ============================ */
            elements.push(
              <div
                key={field.name}
                style={{
                  gridColumn: field.span === 2 ? "span 2" : "span 1",
                }}
              >
                {field.type === "switch" ? (
                  /* ✅ SWITCH ROW */
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: 36,
                    }}
                  >
                    <Text size="2" weight="medium">
                      {field.label}
                    </Text>

                    <FieldRenderer
                      field={field}
                      value={values[field.name]}
                      onChange={(v) => setValue(field.name, v)}
                    />
                  </div>
                ) : (
                  /* ✅ NORMAL FIELD */
                  <>
                    <Text
                      as="label"
                      htmlFor={field.name}
                      size="2"
                      weight="medium"
                      style={{ marginBottom: 4, display: "block" }}
                    >
                      {field.label}
                      {field.required && <Text color="red"> *</Text>}
                    </Text>

                    <FieldRenderer
                      field={field}
                      value={values[field.name]}
                      onChange={(v) => setValue(field.name, v)}
                    />
                  </>
                )}
              </div>
            );

            i++;
          }

          return elements;
        })()}
      </div>

      {/* FORM FOOTER */}
      <Flex mt="3" gap="2">
        {onCancel && (
          <Dialog.Close asChild>
            <Button className="button outline" style={{ flex: 1 }}>
              {cancelText ?? "Cancel"}
            </Button>
          </Dialog.Close>
        )}

        {confirm ? (
          <DynamicAlertDialog
            title={confirm.title}
            description={confirm.description}
            cancelText={confirm.cancelText ?? "Cancel"}
            actionText={confirm.confirmText ?? submitText ?? "Create"}
            onAction={() => onSubmit(values)}
          >
            <Button className="create-btn" style={{ flex: 1 }}>
              {submitText ?? "Create"}
            </Button>
          </DynamicAlertDialog>
        ) : (
          <Button className="create-btn" style={{ flex: 1 }} type="submit">
            {submitText ?? "Create"}
          </Button>
        )}
      </Flex>
    </form>
  );
};

export default DynamicForm;