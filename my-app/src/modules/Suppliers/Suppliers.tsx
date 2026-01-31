import React from "react";
import { Flex, Button, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import Searchbar from "../../components/dynamicComponents/Searchbar";

/* ---------------- SUPPLIERS PAGE ---------------- */

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 🔝 HEADER */}
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

        <Button variant="solid" color="violet">
          <Plus size={16} />
          Add Supplier
        </Button>
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
