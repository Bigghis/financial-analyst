import { Login } from '../components/Login';
import { createLazyFileRoute } from '@tanstack/react-router';
// import '../styles/login.css';

export const Route = createLazyFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="login-page">
      <Login />
    </div>
  );
} 