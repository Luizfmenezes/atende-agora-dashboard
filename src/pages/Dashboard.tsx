
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserManagement } from "@/components/admin/UserManagement";
import { getVisibleAttendanceRecords, getDashboardStats } from "@/lib/attendanceService";
import { Attendance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ waiting: 0, attended: 0, remaining: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Dashboard | SpencerTransportes";
    
    // Carregar dados iniciais
    refreshData();
    
    // Atualizar registros visíveis a cada 10 segundos para esconder registros atendidos
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      
      const records = await getVisibleAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível obter os dados mais recentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilter = async (filters: {
    search: string;
    startDate?: string;
    endDate?: string;
    sector?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    try {
      const records = await getVisibleAttendanceRecords({
        startDate: filters.startDate,
        endDate: filters.endDate,
        sector: filters.sector,
        status: filters.status,
        name: filters.search,
        registration: filters.search
      });
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Erro ao filtrar registros:", error);
      toast({
        title: "Erro ao filtrar",
        description: "Ocorreu um erro ao aplicar os filtros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader 
        onShowUserManagement={setShowUserManagement} 
        showUserManagement={showUserManagement} 
      />
      
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
          <DashboardTabs
            stats={stats}
            attendanceRecords={attendanceRecords}
            onFilter={handleFilter}
            refreshData={refreshData}
            isLoading={isLoading}
          />
        )}
      </main>
      
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
