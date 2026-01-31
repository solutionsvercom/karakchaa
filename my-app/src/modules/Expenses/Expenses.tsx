import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Flex, Button, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown, Plus } from "lucide-react";

/* ---------------- SUMMARY CARD ---------------- */

type SummaryCardProps = {
  title: string;
  value: string;
  accentColor: string;
  softColor: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  accentColor,
  softColor,
}) => {
  return (
    <div
      className="kb-summary-card"
      style={{
        background: softColor,
        color: accentColor,
      }}
    >
      <div>
        <div className="kb-summary-card-title">{title}</div>
        <div className="kb-summary-card-value">{value}</div>
      </div>
    </div>
  );
};

/* ---------------- EXPENSE SUMMARY CARDS ---------------- */

const ExpensesSummaryCards: React.FC = () => {
  return (
    <section className="kb-summary-row">
      <SummaryCard
        title="This Month"
        value="₹0"
        accentColor="#FFFFFF"
        softColor="#EF2A4F"
      />

      <SummaryCard
        title="Total Expenses"
        value="₹1,55,000"
        accentColor="var(--gray-12)"
        softColor="var(--gray-1)"
      />

      <SummaryCard
        title="Total Records"
        value="5"
        accentColor="var(--gray-12)"
        softColor="var(--gray-1)"
      />
    </section>
  );
};

/* ---------------- EXPENSES PAGE ---------------- */

export default function Expenses() {
  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Categories");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 🔝 SUMMARY CARDS */}
      <ExpensesSummaryCards />

      {/*  FILTER BAR */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid var(--gray-6)",
          background: "var(--gray-1)",
        }}
      >
        <Flex align="center" gap="3">
          {/* Search */}
          <Searchbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search expenses..."
          />

          {/* Category Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="outline">
                {category}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {[
                "All Categories",
                "Rent",
                 "Salary",
                 "Utilities",
                 "Supplies",
                 "Inventory",
                "Marketing",
                "Maintenance",
                "Transport",
                "Taxes",
                "Miscellaneous",
            ].map((item) => (
        <DropdownMenu.Item
         key={item}
         onClick={() => setCategory(item)}
                    >
                    {item}
                </DropdownMenu.Item>
            ))}

            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Add Expense */}
          <Button variant="solid" color="violet">
            <Plus size={16} />
            Add Expense
          </Button>
        </Flex>
      </div>

      {/*  EXPENSES TABLE / LIST */}
      <div className="kb-card">
        Expenses table / list goes here
      </div>
    </div>
  );
}
