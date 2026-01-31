
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

// import React from "react";
// import Sales from "../../modules/Sales/Sales";

// export default function DashboardSalesPage() {
//   return <Sales />;
// }
