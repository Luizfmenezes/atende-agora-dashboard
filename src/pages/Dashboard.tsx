
import { useEffect, useState } from "react";
import { getUserDisplayName, isAdmin } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { UserManagement } from "@/components/admin/UserManagement";
import { getAttendanceRecords, getDashboardStats } from "@/lib/attendanceService";
import { Attendance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { UsersRound, ClipboardCheck, Hourglass, LogOut, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(getDashboardStats());
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>(getAttendanceRecords());
  const [showUserManagement, setShowUserManagement] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Dashboard | SpencerTransportes";
  }, []);
  
  const refreshData = () => {
    setStats(getDashboardStats());
    setAttendanceRecords(getAttendanceRecords());
  };
  
  const handleFilter = (filters: {
    search: string;
    startDate?: string;
    endDate?: string;
    sector?: string;
  }) => {
    const records = getAttendanceRecords({
      startDate: filters.startDate,
      endDate: filters.endDate,
      sector: filters.sector,
      name: filters.search,
      registration: filters.search
    });
    
    setAttendanceRecords(records);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7af5e239-358b-4ba3-83a9-f6b902677bfe.png" 
              alt="SpencerTransportes Logo" 
              className="h-10" 
            />
            <h1 className="text-xl font-bold">SpencerTransportes</h1>
          </div>
          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowUserManagement(!showUserManagement)}
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
      
      <main className="flex-1 container mx-auto px-6 py-6">
        {showUserManagement && user.role === "admin" ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
              <Button variant="outline" onClick={() => setShowUserManagement(false)}>
                Voltar ao Dashboard
              </Button>
            </div>
            <UserManagement />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h2>
              <AttendanceForm onAttendanceCreated={refreshData} />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <StatsCard 
                title="Recepção (em espera)" 
                value={stats.waiting}
                icon={<UsersRound className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard 
                title="Atendidos" 
                value={stats.attended}
                icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
              />
              <StatsCard 
                title="Faltam atender" 
                value={stats.remaining}
                icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          
            <FilterBar onFilter={handleFilter} />
            
            <AttendanceTable 
              attendanceRecords={attendanceRecords}
              onAttendanceUpdated={refreshData}
            />
          </>
        )}
      </main>
      
      <footer className="bg-card border-t py-4 px-6">
        <div className="container mx-auto">
          <p className="text-sm text-muted-foreground">
            Usuário: {user.username} ({user.role === "admin" ? "Administrador" : "Usuário"})
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
