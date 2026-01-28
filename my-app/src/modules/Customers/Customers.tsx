import { Button, Dialog, Flex } from "@radix-ui/themes";
import { UserPlus, X } from "lucide-react";
import Form, { FormField } from "../../components/dynamicComponents/Form";

const customerFields: FormField[] = [
 { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter full name", required: true },
  { name: "phone", label: "Phone Number", type: "text", placeholder: "Enter phone number", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
  { name: "address", label: "Address", type: "textarea", placeholder: "Enter address" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes..." },

];

export default function CustomersModule() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>+ Add Customer</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="420px">
        <Flex justify="between" align="center" mb="4">
          <Flex align="center" gap="2">
            <UserPlus size={18} />
            <Dialog.Title style={{ fontSize: 18, fontWeight: 500 }}>Add New Customer</Dialog.Title>
          </Flex>

          <Dialog.Close>
            <Button className="dialog-close-icon">
    <X size={18} />
  </Button>
          </Dialog.Close>
        </Flex>

        <Form fields={customerFields} />

        <Flex mt="4" gap="3">
          <Dialog.Close>
            <Button variant="outline" style={{ flex: 1 }}>
              Cancel
            </Button>
          </Dialog.Close>

          <Button className="create-btn" style={{ flex: 1 }}>
            Create
            </Button>

        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
