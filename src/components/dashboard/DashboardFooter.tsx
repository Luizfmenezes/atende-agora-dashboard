
import { useAuth } from "@/contexts/AuthContext";

export const DashboardFooter = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <footer className="bg-card border-t py-4 px-6">
      <div className="container mx-auto">
        <p className="text-sm text-muted-foreground">
          Usuário: {user.username} ({user.role === "admin" ? "Administrador" : "Usuário"})
        </p>
      </div>
    </footer>
  );
};
