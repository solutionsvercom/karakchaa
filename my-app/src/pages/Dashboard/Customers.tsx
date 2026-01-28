import { Flex, Text } from "@radix-ui/themes";
import CustomersModule from "../../modules/Customers/Customers";

const CustomersPage = () => {
  return (
    <>
      <Flex
        align="center"
        justify="between"
        mb="5"
      >
        <Text size="3" weight="medium">
          Customers Page Coming Soon!
        </Text>

        <CustomersModule />
      </Flex>

      {/* Table / content later */}
    </>
  );
};

export default CustomersPage;
