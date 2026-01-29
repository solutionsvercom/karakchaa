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
      {/* Search input (Radix-styled native input) */}
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
          value={searchValue}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            minWidth: 0,
            fontSize: 14,
            color: "var(--gray-12)",
          }}
        />
      </Flex>

      {/* Category dropdown */}
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
