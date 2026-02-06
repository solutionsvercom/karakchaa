import React from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import {
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

/* ---------- TYPES ---------- */
export type SupplierCardProps = {
  name: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  address: string;
  products: string;
  gst?: string;
  status: "Active" | "Inactive";
  accentColor: string;
  softColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

/* ---------- SUPPLIER CARD ---------- */
export const SupplierCard: React.FC<SupplierCardProps> = ({
  name,
  contactPerson,
  phone,
  email,
  address,
  products,
  gst,
  status,
  accentColor,
  softColor,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="kb-supplier-card">
      {/* ================= HEADER ================= */}
      <div className="kb-supplier-card-header">
        <div className="kb-supplier-card-header-left">
          <div
            className="kb-supplier-card-avatar"
            style={{ background: accentColor }}
          >
            {name.charAt(0)}
          </div>

          <div>
            <div className="kb-supplier-card-name">{name}</div>
            <div className="kb-supplier-card-person">
              {contactPerson}
            </div>
          </div>
        </div>

        {/* 3-DOT MENU */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" size="2">
              <MoreVertical size={18} />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end" sideOffset={6}>
            <DropdownMenu.Item onClick={onEdit}>
              <Pencil size={16} />
              Edit
            </DropdownMenu.Item>

            <DropdownMenu.Separator />

            <DropdownMenu.Item color="red" onClick={onDelete}>
              <Trash2 size={16} />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      {/* ✅ HEADER CLOSED HERE */}

      {/* ================= CONTACT INFO ================= */}
      <div className="kb-supplier-card-details">
        {phone && (
          <div className="kb-supplier-card-row">
            <Phone size={16} />
            <span>{phone}</span>
          </div>
        )}

        {email && (
          <div className="kb-supplier-card-row">
            <Mail size={16} />
            <span>{email}</span>
          </div>
        )}

        <div className="kb-supplier-card-row">
          <MapPin size={16} />
          <span>{address}</span>
        </div>
      </div>

      <div className="kb-supplier-card-divider" />

      {/* ================= PRODUCTS ================= */}
      <div>
        <div className="kb-supplier-card-label">
          Products Supplied
        </div>
        <div>{products}</div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="kb-supplier-card-footer">
        <span
          className={`kb-supplier-status ${
            status === "Active" ? "active" : "inactive"
          }`}
          style={{ background: softColor, color: accentColor }}
        >
          {status}
        </span>

        {gst && (
          <span className="kb-supplier-gst">
            GST: {gst}
          </span>
        )}
      </div>
    </div>
  );
};
