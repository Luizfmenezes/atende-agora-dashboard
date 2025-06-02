
import { UserCog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onShowUserManagement: () => void;
  showUserManagement: boolean;
}

export const DashboardHeader = ({ onShowUserManagement, showUserManagement }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const toggleUserManagement = () => {
    onShowUserManagement();
  };
  
  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/uploads/7af5e239-358b-4ba3-83a9-f6b902677bfe.png" 
            alt="SpencerTransportes Logo" 
            className="h-10" 
          />
          <h1 className="text-xl font-bold">SpencerTransportes</h1>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={toggleUserManagement}
            >
              <UserCog className="mr-2 h-5 w-5" />
              Gerenciar Usuários
            </Button>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
