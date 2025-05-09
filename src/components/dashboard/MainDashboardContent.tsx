
import { useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { UsersRound, ClipboardCheck, Hourglass } from "lucide-react";
import { Attendance } from "@/lib/types";

interface MainDashboardContentProps {
  stats: { waiting: number; attended: number; remaining: number };
  attendanceRecords: Attendance[];
  onFilter: (filters: any) => void;
  refreshData: () => void;
  isLoading: boolean;
}

export const MainDashboardContent = ({ 
  stats, 
  attendanceRecords, 
  onFilter, 
  refreshData,
  isLoading 
}: MainDashboardContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div></div>
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
    
      <FilterBar onFilter={onFilter} />
      
      <AttendanceTable 
        attendanceRecords={attendanceRecords}
        onAttendanceUpdated={refreshData}
      />
      
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md">
          Carregando dados...
        </div>
      )}
    </div>
  );
};
