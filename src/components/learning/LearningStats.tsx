import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { CalendarClock, BookOpen, Award, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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

  const statsContent = (
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
  
  return (
    <>
      {/* Mobile View */}
      {isMobile && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="sm:hidden">
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="flex w-full items-center justify-between mb-4"
            >
              <span>Learning Stats</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {statsContent}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Desktop View */}
      {!isMobile && statsContent}
    </>
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
      <CardHeader className="flex flex-row items-center justify-between py-1.5 px-3 sm:py-1 sm:px-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="py-1.5 px-3 sm:py-2 sm:px-4">
        {loading ? (
          <LoadingIndicator size="sm" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
} 