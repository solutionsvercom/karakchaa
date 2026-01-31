
import { Flex } from "@radix-ui/themes";
import StockManagementModule from "../../modules/Stockmanagement/Stockmanagement";

const StockmanagementPage = () => {
  return (
    <Flex direction="column" gap="5">
      <StockManagementModule />
    </Flex>
  );
};

export default StockmanagementPage;

// import React from "react";
// import Stockmanagement from "../../modules/Stockmanagement/Stockmanagement";

// export default function StockmanagementPage() {
//   return <Stockmanagement />;
// }

