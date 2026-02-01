import React from "react";
import {
  Flex,
  Button,
  Dialog,
  Text,
} from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddSupplier from "./AddSupplier";

/* ---------------- SUPPLIERS PAGE ---------------- */

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 👉 URL based dialog control
  const isAddSupplier = location.pathname.endsWith("/add-supplier");

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

        {/* 👉 URL CHANGE HERE */}
        <Button onClick={() => navigate("/dashboard/suppliers/add-supplier")}>
          <Plus size={16} /> Add Supplier
        </Button>
      </Flex>

      {/* ================= SEARCH ================= */}
      <div style={{ maxWidth: 420 }}>
        <Searchbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          placeholder="Search suppliers..."
        />
      </div>

      {/* ================= TABLE PLACEHOLDER ================= */}
      <div className="kb-card">
        Suppliers table / list goes here
      </div>

      {/* ================= ADD SUPPLIER DIALOG ================= */}
      <Dialog.Root
        open={isAddSupplier}
        onOpenChange={(open) => {
          // dialog close => URL reset
          if (!open) navigate("/dashboard/suppliers");
        }}
      >
        <Dialog.Content maxWidth="420px">
          <AddSupplier
            onClose={() => navigate("/dashboard/suppliers")}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}