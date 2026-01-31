import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Flex, Button, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown, History } from "lucide-react";

/* ---------------- SUMMARY CARD ---------------- */

type SummaryCardProps = {
  title: string;
  value: string;
  accentColor: string;
  softColor: string;
  icon: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  accentColor,
  softColor,
  icon,
}) => {
  return (
    <div className="kb-summary-card">
      <div>
        <div className="kb-summary-card-title">{title}</div>
        <div className="kb-summary-card-value">{value}</div>
      </div>

      <div
        className="kb-summary-card-icon-wrapper"
        style={{ backgroundColor: softColor }}
      >
        <div
          className="kb-summary-card-icon-circle"
          style={{ backgroundColor: accentColor }}
        >
          <span className="kb-summary-card-icon">{icon}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STOCK SUMMARY CARDS ---------------- */

const StockSummaryCards: React.FC = () => {
  return (
    <section className="kb-summary-row">
      <SummaryCard
        title="Total Products"
        value="8"
        accentColor="#7C4DFF"
        softColor="#EDE7FF"
        icon="📦"
      />

      <SummaryCard
        title="Low Stock"
        value="1"
        accentColor="#FF9100"
        softColor="#FFF3E0"
        icon="⚠️"
      />

      <SummaryCard
        title="Out of Stock"
        value="0"
        accentColor="#D50000"
        softColor="#FDECEA"
        icon="❌"
      />

      <SummaryCard
        title="Stock Value"
        value="₹8,150"
        accentColor="#00C853"
        softColor="#E5F9EE"
        icon="📈"
      />
    </section>
  );
};

/* ---------------- STOCK MANAGEMENT PAGE ---------------- */

export default function Stockmanagement() {
  const [searchValue, setSearchValue] = React.useState("");
  const [category, setCategory] = React.useState("All Products");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/*  SUMMARY CARDS */}
      <StockSummaryCards />

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
            placeholder="Search products..."
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
              {["All Products", "Low Stock", "Out of Stock"].map((item) => (
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Stock History Button */}
          <Button variant="soft">
            <History size={16} />
            Stock History
          </Button>
        </Flex>
      </div>

      {/*  STOCK TABLE / LIST */}
      <div className="kb-card">
        Stock table / list goes here
      </div>
    </div>
  );
}
