import React from 'react';
import DashboardCards from '../../components/dynamicComponents/Cards';

const DashboardPage: React.FC = () => {
  return (
    <>
      <DashboardCards />

      {/* You can add charts / tables here later */}
      <section className="kb-main-placeholder">
        Sales Trend (Last 7 Days) / Low Stock, etc.
      </section>
    </>
  );
};

export default DashboardPage;