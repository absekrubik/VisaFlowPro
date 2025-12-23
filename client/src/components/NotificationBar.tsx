import { useQuery } from "@tanstack/react-query";
import { Bell, User, FileText, DollarSign, Settings } from "lucide-react";
import { Link } from "wouter";
import { commonApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: number;
  actorId: number;
  actorRole: string;
  targetType: string;
  targetId: number;
  activityType: string;
  description: string;
  metadata: any;
  createdAt: string;
  actor: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

const activityIcons: Record<string, any> = {
  application_submitted: FileText,
  application_updated: FileText,
  broker_assigned: User,
  document_uploaded: FileText,
  document_reviewed: FileText,
  commission_created: DollarSign,
  profile_updated: Settings,
  status_changed: Settings,
};

function getActivityLink(activity: Activity, userRole: string): string | null {
  const { targetType, targetId, activityType } = activity;
  
  if (userRole === "admin") {
    if (targetType === "client") return `/admin/clients/${targetId}`;
    if (targetType === "agent") return `/admin/agents/${targetId}`;
    if (targetType === "application") return `/admin/applications`;
  }
  
  if (userRole === "agent") {
    if (targetType === "client") return `/agent/clients`;
    if (targetType === "application") return `/agent/applications`;
  }
  
  if (userRole === "client") {
    if (targetType === "application") return `/client/application`;
  }
  
  return null;
}

export function NotificationBar({ userRole }: { userRole: string }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: commonApi.getActivities,
    refetchInterval: 30000,
  });

  const recentActivities = activities.slice(0, 10);
  const unreadCount = Math.min(activities.length, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="notification-trigger">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
              data-testid="notification-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 glass-panel border-white/10">
        <div className="p-3 border-b border-white/10">
          <h4 className="font-semibold text-sm">Recent Activity</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No recent activity
            </div>
          ) : (
            recentActivities.map((activity: Activity) => {
              const IconComponent = activityIcons[activity.activityType] || Bell;
              const link = getActivityLink(activity, userRole);
              const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
              
              const content = (
                <div className="flex items-start gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.actor?.name || "System"} • {timeAgo}
                    </p>
                  </div>
                </div>
              );
              
              return link ? (
                <Link key={activity.id} href={link}>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" data-testid={`activity-${activity.id}`}>
                    {content}
                  </DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuItem key={activity.id} className="p-0 focus:bg-transparent" data-testid={`activity-${activity.id}`}>
                  {content}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
