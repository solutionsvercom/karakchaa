import React from "react";
import { ReactNode } from "react";


/* ---------- TYPES ---------- */
export type SummaryCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  accentColor: string;
  softColor: string;
  icon: string;
};

/* ---------- REUSABLE SUMMARY CARD ---------- */
export const SummaryCard: React.FC<SummaryCardProps> = ({
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