import { useState } from "react";
import { Box, Flex, Text, TextField, TextArea } from "@radix-ui/themes";

export type FormField = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
  placeholder?: string;
  required?: boolean;
};

type Props = {
  fields: FormField[];
};

const Form = ({ fields }: Props) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Flex direction="column" gap="0">
      {fields.map((field) => (
        <Box key={field.name}>
          {/* Label */}
          <Text as="label" size="2" weight="medium">
  {field.label}
  {field.required && (
    <Text as="span" color="red" ml="1">
      *
    </Text>
  )}
</Text>


          {/* Input */}
          <Box mt="">
            {field.type === "textarea" ? (
              <TextArea
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                rows={field.name === "address" ? 2 : 1}
                size="2"
                radius="large"
                style={{ width: "100%" }}
              />
            ) : (
              <TextField.Root
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                size="2"
                radius="large"
                style={{ width: "100%" }}
              />
            )}
          </Box>
        </Box>
      ))}
    </Flex>
  );
};

export default Form;
