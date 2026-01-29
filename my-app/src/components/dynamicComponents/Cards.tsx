import React from 'react';

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
        {subtitle && <div className="kb-summary-card-subtitle">{subtitle}</div>}
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

const DashboardCards: React.FC = () => {
  return (
    <section className="kb-summary-row">
      <SummaryCard
        title="Today's Revenue"
        value="₹0"
        subtitle="0 orders"
        accentColor="#00C853"
        softColor="#E5F9EE"
        icon="₹"
      />

      <SummaryCard
        title="Weekly Revenue"
        value="₹0"
        subtitle="0 orders"
        accentColor="#7C4DFF"
        softColor="#F0E9FF"
        icon="📈"
      />

      <SummaryCard
        title="Total Products"
        value="11"
        subtitle="1 low stock"
        accentColor="#FF9100"
        softColor="#FFF3E0"
        icon="📦"
      />

      <SummaryCard
        title="Total Customers"
        value="6"
        accentColor="#2962FF"
        softColor="#E3F2FD"
        icon="👥"
      />
    

    </section>
  );
};

export default DashboardCards;