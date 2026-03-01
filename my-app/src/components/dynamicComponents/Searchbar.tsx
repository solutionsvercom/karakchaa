import React from "react";
import { Search } from "lucide-react";

type SearchbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
};

export default function Searchbar({
  searchValue,
  onSearchChange,
  placeholder = "Search...",
}: SearchbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid var(--gray-7)",
        background: "var(--gray-1)",
        width: "100%",
      }}
    >
      <Search size={16} />

      <input
        value={searchValue}
        placeholder={placeholder}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: "100%",         
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          color: "var(--gray-12)",
        }}
      />
    </div>
  );
}
