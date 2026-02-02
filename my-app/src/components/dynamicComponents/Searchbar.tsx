import { Flex, DropdownMenu, Button } from "@radix-ui/themes";
import { Search, ChevronDown } from "lucide-react";
import React from "react";

export type SearchbarOption = {
  label: string;
  value: string;
};

type SearchbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  options?: SearchbarOption[];
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  placeholder?: string;
};

export default function Searchbar({
  searchValue,
  onSearchChange,
  options = [],
  selectedOption = "all",
  onOptionChange,
  placeholder = "Search...",
}: SearchbarProps) {
  const activeLabel =
    options.find((o) => o.value === selectedOption)?.label || "All Categories";

  return (
    <Flex align="center" gap="3" style={{ width: "100%" }}>
      {/* SEARCH INPUT */}
      <Flex
        align="center"
        gap="2"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--gray-7)",
          background: "var(--gray-1)",
        }}
      >
        <Search size={16} />

        <input
          type="search"
          name="search"
          autoComplete="off"
          spellCheck={false}
          value={searchValue}
          placeholder={placeholder}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            backgroundImage: "none",     // ✅ KILLS browser icon
            appearance: "none",          // ✅ KILLS autofill UI
            WebkitAppearance: "none",    // ✅ Chrome/Safari
            MozAppearance: "none",       // ✅ Firefox
            flex: 1,
            minWidth: 0,
            width: "100%",
            fontSize: 14,
            lineHeight: "20px",
            color: "var(--gray-12)",
          }}
        />
      </Flex>

      {/* OPTIONAL DROPDOWN */}
      {options.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="outline" style={{ whiteSpace: "nowrap" }}>
              {activeLabel}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {options.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                onClick={() => onOptionChange?.(option.value)}
              >
                {option.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
    </Flex>
  );
}
