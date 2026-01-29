import { Flex } from "@radix-ui/themes";
import ProductsModule from "../../modules/Products/Products";

const ProductsPage = () => {
  return (
    <Flex direction="column" gap="5">
      <ProductsModule />
      {/* Table / content later */}
    </Flex>
  );
};

export default ProductsPage;
