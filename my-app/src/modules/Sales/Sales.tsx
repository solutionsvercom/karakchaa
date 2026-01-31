import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Flex, Button, DropdownMenu } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";

/* ---------------- SUMMARY CARD ---------------- */

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  accentColor: string;
  softColor: string;
  icon: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  accentColor,
  softColor,
  icon,
}) => {
  return (
    <div className="kb-summary-card">
      <div>
        <div className="kb-summary-card-title">{title}</div>
        <div className="kb-summary-card-value">{value}</div>
        {subtitle && (
          <div className="kb-summary-card-subtitle">{subtitle}</div>
        )}
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

/* ---------------- DASHBOARD CARDS ---------------- */

const SalesSummaryCards: React.FC = () => {
  return (
    <section className="kb-summary-row">
      <SummaryCard
        title="Total Revenue"
        value="₹0"
        subtitle="0 orders"
        accentColor="#00C853"
        softColor="#E5F9EE"
        icon="₹"
      />

      <SummaryCard
        title="Total Orders"
        value="0"
        accentColor="#2962FF"
        softColor="#E3F2FD"
        icon="📦"
      />

      <SummaryCard
        title="Average Order"
        value="₹0"
        accentColor="#FF9100"
        softColor="#FFF3E0"
        icon="📊"
      />
    </section>
  );
};

/* ---------------- SALES PAGE ---------------- */

export default function Sales() {
  const [searchValue, setSearchValue] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("Today");
  const [paymentFilter, setPaymentFilter] = React.useState("All Payments");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/*  SUMMARY CARDS */}
      <SalesSummaryCards />

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
          {/* ONE Searchbar */}
          <Searchbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search by invoice or customer..."
          />

          {/* Date Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {dateFilter}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["Today", "This Week", "This Month"].map((item) => (
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setDateFilter(item)}
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Payment Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {paymentFilter}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {["All Payments", "Cash", "UPI", "Card"].map((item) => (
                <DropdownMenu.Item
                  key={item}
                  onClick={() => setPaymentFilter(item)}
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </div>

      {/*  SALES CONTENT */}
      <div className="kb-card">Sales table / list goes here</div>
    </div>
  );
}
