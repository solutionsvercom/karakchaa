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
      

      

    </>
  );
};
export default CustomersPage;
