import React from "react";
import { Box, Heading, Card } from "@radix-ui/themes";
import Customers from "../../modules/Customers/Customers";

const CustomersPage: React.FC = () => {
  return (
    <Box p="6" width="100%">
      <Heading size="8" mb="4">
        Customers
      </Heading>

      <Card style={{ width: "100%", padding: 16 }}>
        <Customers />
      </Card>
    </Box>
  );
};

export default CustomersPage;
