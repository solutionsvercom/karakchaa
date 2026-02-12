import React from "react";
import { Flex, Button, Dialog, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddSupplier from "./AddSupplier";
import { SupplierCard } from "../../components/dynamicComponents/SupplierCard";

/* ---------------- SUPPLIERS DATA ---------------- */

const SUPPLIERS = [
  {
    id: 1,
    name: "Fresh Foods Guwahati",
    contactPerson: "Sanjay Gogoi",
    phone: "9800000002",
    email: "info@freshfoods.com",
    address: "Wholesale Market, Guwahati",
    products: "Vegetables, Fruits, Dairy products",
    gst: "18AABCT5678BZZB",
    status: "Active" as const,
  },
  {
    id: 2,
    name: "Assam Tea Distributors",
    contactPerson: "Mohan Das",
    phone: "9800000001",
    email: "mohan@assam-tea.com",
    address: "Tea Market, Guwahati, Assam",
    products: "Tea leaves, Green tea, Specialty teas",
    gst: "18AABCT1234ATZA",
    status: "Active" as const,
  },
  {
    id: 3,
    name: "Bakery Supplies Co",
    contactPerson: "Anita Devi",
    address: "Industrial Area, Guwahati",
    products: "Flour, Sugar, Bakery ingredients",
    status: "Inactive" as const,
  },
];

/* ---------------- SUPPLIERS PAGE ---------------- */

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");
  const [editingSupplier, setEditingSupplier] =
    React.useState<(typeof SUPPLIERS)[number] | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isAddSupplier = location.pathname.endsWith("/add-supplier");

  /* ---------- SEARCH ---------- */
  const filteredSuppliers = SUPPLIERS.filter((s) =>
    `${s.name} ${s.contactPerson} ${s.products}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

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
            {filteredSuppliers.length} suppliers registered
          </Text>
        </div>

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

      {/* ================= SUPPLIER CARDS ================= */}
      <Flex wrap="wrap" gap="4">
        {filteredSuppliers.map((s) => (
          <SupplierCard
            key={s.id}
            name={s.name}
            contactPerson={s.contactPerson}
            phone={s.phone}
            email={s.email}
            address={s.address}
            products={s.products}
            gst={s.gst}
            status={s.status}
            accentColor=""
            softColor="rgba(124,92,255,0.15)"
            onEdit={() => setEditingSupplier(s)}
            onDelete={() => console.log("Delete", s.id)}
          />
        ))}
      </Flex>

      {/* ================= ADD / EDIT SUPPLIER DIALOG ================= */}
      <Dialog.Root
        open={isAddSupplier || !!editingSupplier}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSupplier(null);
            navigate("/dashboard/suppliers");
          }
        }}
      >
        <Dialog.Content maxWidth="420px">
          <AddSupplier
            mode={editingSupplier ? "edit" : "add"}
            initialValues={
              editingSupplier
                ? {
                    companyName: editingSupplier.name,
                    contactPerson: editingSupplier.contactPerson,
                    phone: editingSupplier.phone,
                    email: editingSupplier.email,
                    address: editingSupplier.address,
                    gst: editingSupplier.gst,
                    productsSupplied: editingSupplier.products,
                    active: editingSupplier.status === "Active",
                  }
                : undefined
            }
            onClose={() => {
              setEditingSupplier(null);
              navigate("/dashboard/suppliers");
            }}
          />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
