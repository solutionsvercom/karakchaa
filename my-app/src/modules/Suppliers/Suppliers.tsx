import React from "react";
import { Flex, Button, Dialog, Text } from "@radix-ui/themes";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import AddSupplier, { SupplierFormValues } from "./AddSupplier";
import { SupplierCard } from "../../components/dynamicComponents/SupplierCard";

/* ---------------- API ---------------- */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const SUPPLIERS_API = `${API_BASE}/api/suppliers`;

/* ---------------- DATA TYPE (MongoDB) ---------------- */
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

  const navigate = useNavigate();
  const location = useLocation();

  const isAddSupplier = location.pathname.endsWith("/add-supplier");

  /* ---------- FETCH LIST ---------- */
  const fetchSuppliers = async () => {
    try {
      const res = await fetch(SUPPLIERS_API);
      const json = await res.json();

      // backend may return { items: [...] } or { data: [...] }
      const items = json?.items || json?.data || json || [];
      setSuppliers(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error("Failed to load suppliers", e);
      setSuppliers([]);
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  /* ---------- SEARCH ---------- */
  const filteredSuppliers = suppliers.filter((s) =>
    `${s.companyName} ${s.contactPerson} ${s.productsSupplied || ""}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this supplier?");
    if (!ok) return;

    try {
      await fetch(`${SUPPLIERS_API}/${id}`, { method: "DELETE" });
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
      if (editingSupplier?._id === id) setEditingSupplier(null);
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed. Please try again.");
    }
  };

  /* ---------- SAVE (ADD / EDIT) ---------- */
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
        const res = await fetch(`${SUPPLIERS_API}/${editingSupplier._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        const updated = json?.data || json;

        setSuppliers((prev) =>
          prev.map((s) => (s._id === editingSupplier._id ? updated : s))
        );

        setEditingSupplier(null);
        navigate("/dashboard/suppliers");
        return;
      }

      // ADD
      const res = await fetch(SUPPLIERS_API, {
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
      alert("Save failed. Please try again.");
    }
  };

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
            onDelete={() => handleDelete(s._id)}
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
