
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainDashboardContent } from "@/components/dashboard/MainDashboardContent";
import RecordsPage from "@/components/records/RecordsPage";
import { Attendance } from "@/lib/types";

interface DashboardTabsProps {
  stats: { waiting: number; attended: number; remaining: number };
  attendanceRecords: Attendance[];
  onFilter: (filters: any) => void;
  refreshData: () => void;
  isLoading: boolean;
}

export const DashboardTabs = ({
  stats,
  attendanceRecords,
  onFilter,
  refreshData,
  isLoading
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Registros</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="dashboard" className="mt-0">
        <MainDashboardContent
          stats={stats}
          attendanceRecords={attendanceRecords}
          onFilter={onFilter}
          refreshData={refreshData}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="records" className="mt-0">
        <RecordsPage />
      </TabsContent>
    </Tabs>
  );
};
