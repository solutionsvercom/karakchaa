import React from "react";
import Searchbar from "../../components/dynamicComponents/Searchbar";
import { Flex, Text, Button, Box, DropdownMenu, Dialog } from "@radix-ui/themes";
import { ChevronDown ,Wallet,Edit, Trash2,MoreVertical} from "lucide-react";
import { CheckIcon, } from "@radix-ui/react-icons";

import AddExpense from "./AddExpense";

/* ---------------- SUMMARY CARD ---------------- */

type SummaryCardProps = {
  title: string;
  value: string;
  accentColor: string;
  softColor: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, accentColor, softColor }) => {
  return (
    <Flex
      direction="column"
      justify="center"
      style={{
        background: softColor,
        color: accentColor,
        flex: 1,
        padding: "20px",
        borderRadius: 12,
        border: "1px var(--gray-6)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Text size="2">{title}</Text>
      <Text size="6" weight="bold">
        {value}
      </Text>
    </Flex>
  );
};

/* ---------------- EXPENSE SUMMARY CARDS ---------------- */

const ExpensesSummaryCards: React.FC = () => {
  return (
    <Flex gap="4" width="100%">
      <SummaryCard title="This Month" value="₹0" accentColor="#FFFFFF" softColor="#EF2A4F" />
      <SummaryCard title="Total Expenses" value="₹1,55,000" accentColor="var(--gray-12)" softColor="var(--gray-1)" />
      <SummaryCard title="Total Records" value="5" accentColor="var(--gray-12)" softColor="var(--gray-1)" />
    </Flex>
  );
};

/* ---------------- EXPENSES TABLE ---------------- */
const categoryColors: Record<
  string,
  { bg: string; text: string }
> = {
  inventory: { bg: "#FCE7F3", text: "#BE185D" },
  supplies: { bg: "#DCFCE7", text: "#15803D" },
  utilities: { bg: "#FEF3C7", text: "#B45309" },
  rent: { bg: "#EDE9FE", text: "#6D28D9" },
  salary: { bg: "#DBEAFE", text: "#1D4ED8" },
  transport: { bg: "#FFE4E6", text: "#BE123C" },
};




type Expense = {
  id: number;
  title: string;
  category: string;
  vendor: string;
  amount: string;
  payment: string;
  date: string;
};

const dummyExpenses: Expense[] = [
  { id: 1, title: "Tea Inventory", category: "Inventory", vendor: "Assam Tea Distributors", amount: "₹15,000", payment: "Bank Transfer", date: "12-Jan-2025" },
  { id: 2, title: "Kitchen Supplies", category: "Supplies", vendor: "Fresh Foods Guwahati", amount: "₹8,500", payment: "Cash", date: "10-Jan-2025" },
  { id: 3, title: "Electricity Bill", category: "Utilities", vendor: "APDCL", amount: "₹4,500", payment: "UPI", date: "05-Jan-2025" },
  { id: 4, title: "Monthly Rent", category: "Rent", vendor: "Property Owner", amount: "₹25,000", payment: "Bank Transfer", date: "01-Jan-2025" },
];

const ExpensesTable: React.FC = () => {
  return (
    <Box
      style={{
        border: "1px solid var(--gray-5)",
        borderRadius: "14px",
        // backgroundColor: "white",
        overflow: "hidden", 
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "fixed",
          fontSize: "14px",
          color: "var(--gray-12)",
        }}
      >
        {/* ---------- HEADER ---------- */}
        <thead style={{ background: "var(--gray-2)" }}>
          <tr>
            {["Title", "Category", "Vendor", "Amount", "Payment", "Date", "Actions"].map(
              (head) => (
                <th
                  key={head}
                  style={{
                    padding: "14px 16px",
                    textAlign: head === "Amount" ? "right" : "left",
                    fontWeight: 600,
                    fontSize: "14px",
                    borderBottom: "1px solid var(--gray-5)",
                    color: "var(--gray-11)",
                  }}
                >
                  {head}
                </th>
              )
            )}
          </tr>
        </thead>

        {/* ---------- BODY ---------- */}
        <tbody>
          {dummyExpenses.map((exp) => (
            <tr
              key={exp.id}
              style={{
                height: "52px",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--gray-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {/* Title */}
              <td style={{ padding: "12px 16px", fontWeight: 500,borderBottom: "1px solid var(--gray-4)", }}>
                {exp.title}
              </td>

              {/* Category pill */}
              <td style={{ padding: "12px 16px",borderBottom: "1px solid var(--gray-4)", }}>
              {(() => {
                const color =
                  categoryColors[exp.category.toLowerCase()] ?? {
                    bg: "var(--gray-3)",
                    text: "var(--gray-11)",
                  };
              return(
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: color.bg,
                    color: color.text,
                    textTransform: "lowercase",
                    lineHeight: "1",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {exp.category.toLowerCase()}
                </span>
            );
          })()}
              </td>

              {/* Vendor */}
              <td style={{ padding: "12px 16px", color: "var(--gray-11)",borderBottom: "1px solid var(--gray-4)", }}>
                {exp.vendor}
              </td>

              {/* Amount */}
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  color: "var(--red-9)",
                  fontWeight: 500,
                  borderBottom: "1px solid var(--gray-4)",
                }}
              >
                {exp.amount}
              </td>

              {/* Payment */}
              <td style={{ padding: "12px 16px",borderBottom: "1px solid var(--gray-4)", }}>{exp.payment}</td>

              {/* Date */}
              <td style={{ padding: "12px 16px", color: "var(--gray-11)",borderBottom: "1px solid var(--gray-4)", }}>
                {exp.date}
              </td>

              {/* Actions */}
                        
          <td style={{ padding: "12px 16px", textAlign: "center",borderBottom: "1px solid var(--gray-4)", }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger >
                <Button
                  variant="ghost"
                  style={{
                    padding: "6px",
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <MoreVertical size={18} color="var(--gray-12)" />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                align="end"
                sideOffset={5}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "6px",
                  minWidth: "140px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  border: "1px solid var(--gray-5)",
                }}
              >
              {/* Edit */}
              <DropdownMenu.Item
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "black",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--gray-3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Edit size={16} />
                Edit
              </DropdownMenu.Item>

              {/* Delete */}
              <DropdownMenu.Item
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "var(--red-9)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--gray-3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Trash2 size={16} />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </td>


            </tr>
              ))}
            </tbody>
          </table>
        </Box>
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

      {/* FILTER BAR */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px var(--gray-6)",
          background: "var(--gray-1)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Flex align="center" gap="3">
          {/* Search */}
          <Box style={{ width: "60%" }}>
            <Searchbar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              placeholder="Search expenses..."
            />
          </Box>

          {/* Category Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                variant="outline"
                style={{
                backgroundColor: "white",
                  
                  color: "var(--gray-12)",
                  border: "1px solid #d1d5db",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  minWidth: "180px",
                  display: "flex",
                  justifyContent: "space-between",
                }}

                
              >
                {category}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="start"
              sideOffset={5}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "6px",
                minWidth: "180px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                border: "1px solid var(--gray-5)",
              }}
              >
              
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
                <DropdownMenu.Item key={item} onClick={() => setCategory(item)}
                style={{
                   padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    outline: "none",
                    color:"black"
                        }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--gray-3)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                                
                >
                  {item}

                  {category === item && (
                  <CheckIcon
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "var(--gray-11)",
                    }}
                    />
                  )}

                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Add Expense */}
          <Dialog.Root>
            <Dialog.Trigger>
              <Button
                style={{
                  minWidth: "160px",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <span>+</span>
                <span>Add Expense</span>
              </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="380px">
  {/* Header */}
  <Flex
    align="center"
    gap="2"
    style={{ marginBottom: "16px" }}
  >
    <Wallet size={18} color="var(--accent-9)" />
    <Text size="4" weight="medium">
      Add Expense
    </Text>
  </Flex>

  {/* Form */}
  <AddExpense />
</Dialog.Content>

          </Dialog.Root>
        </Flex>
      </div>

      {/* EXPENSES TABLE */}
<div className="kb-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {/* Header with wallet icon */}
  <Flex
  align="center"
  gap="2"
  style={{
    padding: "16px",
    
  }}
>
  <Box
    style={{
      marginLeft: "4px", 
      display: "flex",
      alignItems: "center",
      color: "var(--accent-9)", 
    }}
  >
    <Wallet width={18} height={18} />
  </Box>

  <Text
    size="3"
    weight="medium"
    style={{ color: "var(--gray-12)" }}
  >
    Expense Records
  </Text>
</Flex>


  {/* Table */}
  <ExpensesTable />
</div>

    </div>
  );
}