import { Text, Heading } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div>
      <Heading size="2" mb="2">Dashboard</Heading>
      <Text size="2" color="gray">Dashboard — coming soon.</Text>
      <Outlet/>
    </div>
  );
}
