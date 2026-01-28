import { Button, Dialog, Flex } from "@radix-ui/themes";
import { UserPlus, X } from "lucide-react";
import Form, { FormField } from "../../components/dynamicComponents/Form";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";

const ProductsFields: FormField[] = [
  {
    name: "productName",
    label: "Product Name",
    type: "text",
    placeholder: "Enter product name",
    required: true,
  },
  {
    name: "sku",
    label: "SKU",
    type: "text",
    placeholder: "Enter SKU",
  },
  {
    name: "price",
    label: "Price",
    type: "text",
    placeholder: "Enter price",
    required: true,
  },
  {
    name: "stock",
    label: "Stock Quantity",
    type: "text",
    placeholder: "Enter stock quantity",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Product description...",
  },
];

export default function ProductsModule() {

  // define functions here 
  const handleCreateProduct = async () => {
    console.log("Create confirmed");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>+ Add Product</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="420px">
        <Flex justify="between" align="center" mb="4">
          <Flex align="center" gap="2">
            <UserPlus size={18} />
            <Dialog.Title style={{ fontSize: 18, fontWeight: 500 }}>
              Add New Product
            </Dialog.Title>
          </Flex>

          <Dialog.Close>
            <Button className="dialog-close-icon">
              <X size={18} />
            </Button>
          </Dialog.Close>
        </Flex>

        <Form fields={ProductsFields} />

        <Flex mt="4" gap="3">
          <Dialog.Close>
            <Button
    variant="outline"
    className="dialog-cancel-btn"
    style={{ flex: 1 }}
  >
              Cancel
            </Button>
          </Dialog.Close>

          <DynamicAlertDialog
            title="Are you absolutely sure?"
            description="This action cannot be undone."
            cancelText="No, go back"
            actionText="Yes, Create"
            color="red"
            onAction={handleCreateProduct}
          >
            <Button className="create-btn" style={{ flex: 1 }}>
              Create
            </Button>
          </DynamicAlertDialog>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
