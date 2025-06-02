
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { getDashboardStats, getVisibleAttendanceRecords } from "@/lib/attendanceService";
import { Attendance, DashboardStats } from "@/lib/types";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ waiting: 0, attended: 0, remaining: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        getDashboardStats(),
        getVisibleAttendanceRecords(filters)
      ]);
      setStats(statsData);
      setAttendanceRecords(recordsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleToggleUserManagement = () => {
    setShowUserManagement(!showUserManagement);
  };

  if (showUserManagement) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          onShowUserManagement={handleToggleUserManagement}
          showUserManagement={showUserManagement}
        />
        <main className="container mx-auto py-6 px-6">
          <UserManagement />
        </main>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onShowUserManagement={handleToggleUserManagement}
        showUserManagement={showUserManagement}
      />
      <main className="container mx-auto py-6 px-6">
        <DashboardTabs
          stats={stats}
          attendanceRecords={attendanceRecords}
          onFilter={handleFilter}
          refreshData={loadData}
          isLoading={isLoading}
        />
      </main>
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
