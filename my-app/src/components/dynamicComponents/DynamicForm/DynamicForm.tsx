import { useState } from "react";
import { Text } from "@radix-ui/themes";
import FieldRenderer from "./FieldRenderer";
import { FormField } from "./types";
import type { ReactNode } from "react";

type Props<T extends string> = {
  fields: FormField<T>[];
  onSubmit: (values: Record<T, any>) => void;
};

const DynamicForm = <T extends string>({
  fields,
  onSubmit,
}: Props<T>) => {
  const [values, setValues] = useState<Record<T, any>>({} as Record<T, any>);

  const setValue = (name: T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
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
                    gap: 16,
                  }}
                >
                  {tripleFields.map((f) => (
                    <div key={f.name}>
                      <Text
                        as="label"
                        htmlFor={f.name}
                        size="2"
                        weight="medium"
                        style={{ marginBottom: 6, display: "block" }}
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

              i += 3; // ⬅️ consume 3 fields
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
          style={{ marginBottom: 6, display: "block" }}
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
    </form>
  );
};

export default DynamicForm;
