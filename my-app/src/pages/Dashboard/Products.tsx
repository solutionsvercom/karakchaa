import { Flex, Text } from "@radix-ui/themes";
import CustomersModule from "../../modules/Products/Products";

const ProductsPage = () => {
  return (
    <>
      <Flex
        align="center"
        justify="between"
        mb="5"
      >
        <Text size="3" weight="medium">
          Product Page Coming Soon!
        </Text>

        <CustomersModule />
      </Flex>

      {/* Table / content later */}
    </>
  );
};

export default ProductsPage;
