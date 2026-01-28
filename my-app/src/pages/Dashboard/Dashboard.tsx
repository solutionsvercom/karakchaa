import { Text, Heading } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
import React from 'react';
import DashboardCards from '../../components/dynamicComponents/Cards';

const DashboardPage: React.FC = () => {
  return (
    <><div>
      <Heading size="2" mb="2">Dashboard</Heading>
      <Text size="2" color="gray">Dashboard — coming soon.</Text>
      <Outlet />
    </div><>
        <DashboardCards />

        {/* You can add charts / tables here later */}
        <section className="kb-main-placeholder">
          Sales Trend (Last 7 Days) / Low Stock, etc.
        </section>
      </></>
  );
};

export default DashboardPage;