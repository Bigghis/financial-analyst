import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '../components/MainLayout';

export const Route = createFileRoute('/home')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="home-page">
      <MainLayout />
    </div>
  );
} 