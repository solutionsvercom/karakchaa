import React from "react";
import { Flex, Button, Dialog, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_SUPPLIERS } from "../../config/Api";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddSupplier, { SupplierFormValues } from "./AddSupplier";
import { SupplierCard } from "../../components/dynamicComponents/SupplierCard";


type SupplierUI = {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  address?: string;
  productsSupplied?: string;
  gst?: string;
  paymentTerms?: string;
  active: boolean;
};

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");
  const [suppliers, setSuppliers] = React.useState<SupplierUI[]>([]);
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierUI | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isAddSupplier = location.pathname.endsWith("/add-supplier");

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(API_SUPPLIERS);
      const json = await res.json();
      const items = json?.items || json?.data || json || [];
      setSuppliers(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error("Failed to load suppliers", e);
      setSuppliers([]);
    }
  };

  React.useEffect(() => { fetchSuppliers(); }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    `${s.companyName} ${s.contactPerson} ${s.productsSupplied || ""}`
      .toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API_SUPPLIERS}/${deleteId}`, { method: "DELETE" });
      setSuppliers((prev) => prev.filter((s) => s._id !== deleteId));
      if (editingSupplier?._id === deleteId) setEditingSupplier(null);
      setDeleteId(null);
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleSave = async (form: SupplierFormValues) => {
    const payload = {
      companyName: form.companyName || "",
      contactPerson: form.contactPerson || "",
      phone: form.phone || "",
      email: form.email || "",
      address: form.address || "",
      gst: form.gst || "",
      paymentTerms: form.paymentTerms || "",
      productsSupplied: form.productsSupplied || "",
      active: !!form.active,
    };

    try {
      if (editingSupplier) {
        const res = await fetch(`${API_SUPPLIERS}/${editingSupplier._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        const updated = json?.data || json;
        setSuppliers((prev) => prev.map((s) => (s._id === editingSupplier._id ? updated : s)));
        setEditingSupplier(null);
        navigate("/dashboard/suppliers");
        return;
      }

      const res = await fetch(API_SUPPLIERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const created = json?.data || json;
      setSuppliers((prev) => [created, ...prev]);
      navigate("/dashboard/suppliers");
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Flex justify="between" align="center">
        <div>
          <Text size="5" weight="bold">Suppliers</Text>
          <br />
          <Text size="2" color="gray">{filteredSuppliers.length} suppliers registered</Text>
        </div>
        <Button onClick={() => navigate("/dashboard/suppliers/add-supplier")}>
          <Plus size={16} /> Add Supplier
        </Button>
      </Flex>

      <div style={{ maxWidth: 420 }}>
        <Searchbar searchValue={searchValue} onSearchChange={setSearchValue} placeholder="Search suppliers..." />
      </div>

      <Flex wrap="wrap" gap="4">
        {filteredSuppliers.length === 0 ? (
          <Flex
            width="100%"
            align="center"
            justify="center"
            style={{ padding: "60px 0", color: "#9ca3af", fontSize: 16 }}
          >
            No suppliers found
          </Flex>
        ) : (
          filteredSuppliers.map((s) => (
            <SupplierCard
              key={s._id}
              name={s.companyName}
              contactPerson={s.contactPerson}
              phone={s.phone}
              email={s.email}
              address={s.address ?? ""}
              products={s.productsSupplied ?? ""}
              gst={s.gst}
              status={s.active ? "Active" : "Inactive"}
              accentColor=""
              softColor="rgba(124,92,255,0.15)"
              onEdit={() => {
                navigate(`/dashboard/suppliers/edit-supplier/${s._id}`);
                setEditingSupplier(s);
              }}
              onDelete={() => setDeleteId(s._id)}
            />
          ))
        )}
      </Flex>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog.Root
        open={isAddSupplier || !!editingSupplier}
        onOpenChange={(open) => {
          if (!open) { setEditingSupplier(null); navigate("/dashboard/suppliers"); }
        }}
      >
        <Dialog.Content maxWidth="420px">
          <AddSupplier
            mode={editingSupplier ? "edit" : "add"}
            initialValues={
              editingSupplier
                ? {
                  companyName: editingSupplier.companyName,
                  contactPerson: editingSupplier.contactPerson,
                  phone: editingSupplier.phone,
                  email: editingSupplier.email,
                  address: editingSupplier.address,
                  gst: editingSupplier.gst,
                  paymentTerms: editingSupplier.paymentTerms,
                  productsSupplied: editingSupplier.productsSupplied,
                  active: editingSupplier.active,
                }
                : { active: true }
            }
            onSave={handleSave}
            onClose={() => { setEditingSupplier(null); navigate("/dashboard/suppliers"); }}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* ===== DELETE CONFIRM DIALOG ===== */}
      <Dialog.Root open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <Dialog.Content maxWidth="380px" aria-describedby={undefined}>
          <Dialog.Title>Delete Supplier?</Dialog.Title>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            This action cannot be undone. Are you sure you want to delete this supplier?
          </p>
          <Flex justify="end" gap="3" mt="4">
            <Button
              variant="soft"
              color="gray"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>Delete</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}