import { Flex } from "@radix-ui/themes";
import SalesModule from "../../modules/Sales/Sales";

const SalesPage = () => {
  return (
    <Flex direction="column" gap="5">
      <SalesModule />
    </Flex>
  );
};

export default SalesPage;