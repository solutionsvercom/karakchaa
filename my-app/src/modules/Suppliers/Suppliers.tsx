import React from "react";
import { Flex, Button,Dialog, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddSupplier from "./AddSupplier";


/* ---------------- SUPPLIERS PAGE ---------------- */

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    
      {/* ================= HEADER ================= */}
      <Flex justify="between" align="center">
        <div>
         <Text size="5" weight="bold">
            Suppliers
          </Text>
          <br />
          <Text size="2" color="gray">
            3 suppliers registered
          </Text>
        </div>

        <Dialog.Root>
          <Dialog.Trigger>
            <Button>+ Add Supplier</Button>
          </Dialog.Trigger>

          <Dialog.Content maxWidth="380px">
          <AddSupplier />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {/*  SEARCH */}
      <div style={{ maxWidth: 420 }}>
        <Searchbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          placeholder="Search suppliers..."
        />
      </div>

      {/*  SUPPLIERS LIST / TABLE */}
      <div className="kb-card">
        Suppliers table / list goes here
      </div>
    </div>
  );
}
