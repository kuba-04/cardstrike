import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { CalendarClock, BookOpen, Award, RotateCcw } from "lucide-react";

interface LearningStatsData {
  dueToday: number;
  learningCards: number;
  masteredCards: number;
  totalReviews: number;
}

export function LearningStats() {
  const [stats, setStats] = useState<LearningStatsData>({
    dueToday: 0,
    learningCards: 0,
    masteredCards: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/flashcards/learning-stats");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch learning statistics");
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching learning stats:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Due Today" 
        value={stats.dueToday} 
        icon={<CalendarClock className="h-4 w-4" />}
        loading={loading}
      />
      
      <StatCard 
        title="Learning" 
        value={stats.learningCards} 
        icon={<BookOpen className="h-4 w-4" />}
        loading={loading}
      />
      
      <StatCard 
        title="Mastered" 
        value={stats.masteredCards} 
        icon={<Award className="h-4 w-4" />}
        loading={loading}
      />
      
      <StatCard 
        title="Total Reviews" 
        value={stats.totalReviews} 
        icon={<RotateCcw className="h-4 w-4" />}
        loading={loading}
      />
      
      {error && (
        <div className="col-span-full mt-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, icon, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="py-2 px-4">
        {loading ? (
          <LoadingIndicator size="sm" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
} 