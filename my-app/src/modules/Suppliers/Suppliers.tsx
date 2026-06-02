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

/** API / legacy DB may use `name` and `gstNumber` instead of `companyName` / `gst`. */
function normalizeSupplier(raw: Record<string, unknown>): SupplierUI | null {
  const id = raw._id;
  if (typeof id !== "string" || !id) return null;

  const companyName =
    (typeof raw.companyName === "string" && raw.companyName.trim()) ||
    (typeof raw.name === "string" && raw.name.trim()) ||
    "Unnamed supplier";

  const contactPerson =
    (typeof raw.contactPerson === "string" && raw.contactPerson.trim()) ||
    "—";

  const gst =
    (typeof raw.gst === "string" && raw.gst) ||
    (typeof raw.gstNumber === "string" && raw.gstNumber) ||
    "";

  return {
    _id: id,
    companyName,
    contactPerson,
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    address: typeof raw.address === "string" ? raw.address : "",
    productsSupplied:
      typeof raw.productsSupplied === "string" ? raw.productsSupplied : "",
    gst,
    paymentTerms:
      typeof raw.paymentTerms === "string" ? raw.paymentTerms : "",
    active: raw.active !== false && raw.status !== "Inactive",
  };
}

export default function Suppliers() {
  const [searchValue, setSearchValue] = React.useState("");
  const [suppliers, setSuppliers] = React.useState<SupplierUI[]>([]);
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierUI | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isAddSupplier = location.pathname.endsWith("/add-supplier");

  const fetchSuppliers = async () => {
    setLoadError(null);
    try {
      const res = await fetch(API_SUPPLIERS);
      const json = await res.json();
      const items = json?.items || json?.data?.items || json?.data || [];
      const list = Array.isArray(items) ? items : [];
      setSuppliers(
        list
          .map((item) => normalizeSupplier(item as Record<string, unknown>))
          .filter((s): s is SupplierUI => s !== null)
      );
    } catch {
      setLoadError("Could not load suppliers. Check your connection and try again.");
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
    } catch {
      setActionError("Could not delete supplier. Try again.");
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

    setActionError(null);
    try {
      if (editingSupplier) {
        const res = await fetch(`${API_SUPPLIERS}/${editingSupplier._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          setActionError(
            typeof errJson?.message === "string"
              ? errJson.message
              : "Could not update supplier."
          );
          return;
        }
        const json = await res.json();
        const updated = normalizeSupplier(
          (json?.data || json) as Record<string, unknown>
        );
        if (!updated) {
          setActionError("Could not update supplier.");
          return;
        }
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
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setActionError(
          typeof errJson?.message === "string"
            ? errJson.message
            : "Could not create supplier."
        );
        return;
      }
      const json = await res.json();
      const created = normalizeSupplier(
        (json?.data || json) as Record<string, unknown>
      );
      if (!created) {
        setActionError("Could not create supplier.");
        return;
      }
      setSuppliers((prev) => [created, ...prev]);
      navigate("/dashboard/suppliers");
    } catch {
      setActionError("Could not save supplier. Check your connection and try again.");
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

      {loadError && (
        <Text color="red" size="2">{loadError}</Text>
      )}
      {actionError && (
        <Text color="red" size="2">{actionError}</Text>
      )}

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
              status={
                <span style={{ color: s.active ? "#16a34a" : "#dc2626" }}>
                  {s.active ? "Active" : "Inactive"}
                </span>
              }
              accentColor=""
              softColor={s.active ? "rgba(124,92,255,0.15)" : "rgba(220,38,38,0.15)"}
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