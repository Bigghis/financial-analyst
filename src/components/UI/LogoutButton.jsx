import { useAuth } from '../../context/AuthContext';
import { useAsset } from '../../context/AssetContext';
import { useNavigate } from '@tanstack/react-router';

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { clearAssetState } = useAsset();
  const handleLogout = async () => {
    try {
      await logout();
      clearAssetState();
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
} 