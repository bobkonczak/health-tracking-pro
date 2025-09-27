import { Metadata } from 'next';
import ClientDashboard from './ClientDashboard';

export const metadata: Metadata = {
  title: 'Health Tracking Pro - Dashboard',
  description: 'Track your health journey with Bob & Paula',
};

export default function HomePage() {
  return <ClientDashboard />;
}