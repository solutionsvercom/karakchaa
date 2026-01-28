import React from "react";
import { Flex, Text, Box, Heading, Card } from "@radix-ui/themes";
import Customers from "../../modules/Customers/Customers";
import CustomersModule from "../../modules/Customers/Customers";





const CustomersPage = () => {
  return (
    <>
      <Flex
        align="center"
        justify="between"
        mb="5"
      >
        

        <CustomersModule />
      </Flex>
      

      {/* Table / content later */}

    </>
  );
};

const CustomsersPage: React.FC = () => {
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
}



export default CustomersPage;
