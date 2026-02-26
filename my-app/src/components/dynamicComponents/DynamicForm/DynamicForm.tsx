import { useState, useEffect, useRef } from "react";
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
  onFieldChange?: (fieldName: T, value: any) => void;
  extraContent?: ReactNode;
  onBeforeSubmit?: (values: Record<T, any>) => boolean | Promise<boolean>;
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
  onFieldChange,
  extraContent,
  onBeforeSubmit,
}: Props<T>) => {
  const [values, setValues] = useState<Record<T, any>>(
    (initialValues ?? {}) as Record<T, any>
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  // ✅ Only initialise values ONCE when the form first mounts (or when the
  //    key prop changes from outside, which fully remounts the component).
  //    We deliberately do NOT re-run this when initialValues changes during
  //    normal interaction — that was what was wiping the user's input.
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current && initialValues) {
      setValues((initialValues ?? {}) as Record<T, any>);
      initialised.current = true;
    }
  }, [initialValues]);

  const setValue = (name: T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (onFieldChange) onFieldChange(name, value);
  };

  const handleSubmitClick = async () => {
    if (checking) return;

    if (onBeforeSubmit) {
      setChecking(true);
      const allowed = await onBeforeSubmit(values);
      setChecking(false);
      if (!allowed) return;
    }

    if (confirm) {
      setConfirmOpen(true);
    } else {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmitClick(); }}>
      {/* HEADER */}
      {title && (
        <Flex justify="between" align="center" mb="4">
          <Text weight="bold" size="4">{title}</Text>
          <Dialog.Close asChild>
            <Button variant="ghost" className="dialog-close-icon">
              <X size={18} />
            </Button>
          </Dialog.Close>
        </Flex>
      )}

      {/* MAIN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {(() => {
          const elements: ReactNode[] = [];
          let i = 0;

          while (i < fields.length) {
            const field = fields[i];

            if (field.group === "triple") {
              const tripleFields = fields.slice(i, i + 3);
              elements.push(
                <div
                  key={`triple-${field.name}`}
                  style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
                >
                  {tripleFields.map((f) => (
                    <div key={f.name}>
                      <Text
                        as="label"
                        htmlFor={f.name}
                        size="2"
                        weight="medium"
                        style={{ marginBottom: 4, display: "block", color: f.disabled ? "var(--gray-9)" : undefined }}
                      >
                        {f.label}
                        {f.required && <Text color="red"> *</Text>}
                        {f.disabled && <span style={{ marginLeft: 4, fontSize: 12 }}>🔒</span>}
                      </Text>
                      <FieldRenderer field={f} value={values[f.name]} onChange={(v) => setValue(f.name, v)} disabled={f.disabled} />
                    </div>
                  ))}
                </div>
              );
              i += 3;
              continue;
            }

            elements.push(
              <div key={field.name} style={{ gridColumn: field.span === 2 ? "span 2" : "span 1" }}>
                {field.type === "switch" ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36 }}>
                    <Text size="2" weight="medium">{field.label}</Text>
                    <FieldRenderer field={field} value={values[field.name]} onChange={(v) => setValue(field.name, v)} />
                  </div>
                ) : (
                  <>
                    <Text as="label" htmlFor={field.name} size="2" weight="medium" style={{ marginBottom: 4, display: "block" }}>
                      {field.label}
                      {field.required && <Text color="red"> *</Text>}
                    </Text>
                    <FieldRenderer field={field} value={values[field.name]} onChange={(v) => setValue(field.name, v)} disabled={field.disabled} />
                  </>
                )}
              </div>
            );
            i++;
          }

          return elements;
        })()}
      </div>

      {/* EXTRA CONTENT SLOT */}
      {extraContent && <div style={{ marginTop: 12 }}>{extraContent}</div>}

      {/* FOOTER */}
      <Flex mt="3" gap="2">
        {onCancel && (
          <Dialog.Close asChild>
            <Button className="button outline" style={{ flex: 1 }}>{cancelText ?? "Cancel"}</Button>
          </Dialog.Close>
        )}

        {confirm ? (
          <>
            <Button className="create-btn" style={{ flex: 1 }} type="submit" disabled={checking}>
              {checking ? "Checking..." : (submitText ?? "Create")}
            </Button>

            <DynamicAlertDialog
              title={confirm.title}
              description={confirm.description}
              cancelText={confirm.cancelText ?? "Cancel"}
              actionText={confirm.confirmText ?? submitText ?? "Create"}
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              onAction={() => onSubmit(values)}
            >
              <span style={{ display: "none" }} />
            </DynamicAlertDialog>
          </>
        ) : (
          <Button className="create-btn" style={{ flex: 1 }} type="submit" disabled={checking}>
            {checking ? "Checking..." : (submitText ?? "Create")}
          </Button>
        )}
      </Flex>
    </form>
  );
};

export default DynamicForm;