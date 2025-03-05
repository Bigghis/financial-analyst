import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from '../context/AuthContext';
// import { AuthGuard } from '../components/AuthGuard';



export const Route = createFileRoute("/posts")({
  component: Posts,
});

function Posts() {
  const { isAuthenticated } = useAuth();
  
  return (
    // <AuthGuard> 
    <div className="p-2">
      <h3>Hello from Post!</h3>
      <p>You are {isAuthenticated() ? 'authenticated' : 'not authenticated'}</p>
        </div>
    // </AuthGuard>
  );
}
