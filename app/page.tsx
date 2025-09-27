import { Metadata } from 'next';
import DashboardPage from './dashboard/page';

export const metadata: Metadata = {
  title: 'Health Tracking Pro - Dashboard',
  description: 'Track your health journey with Bob & Paula',
};

export default function HomePage() {
  return <DashboardPage />;
}