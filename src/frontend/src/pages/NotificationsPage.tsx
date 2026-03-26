import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff, Package, Plane } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useNavigation } from "../context/NavigationContext";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
} from "../hooks/useQueries";

function timeAgo(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsPage() {
  const { navigate } = useNavigation();
  const { data: notifications = [], isLoading } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: (typeof notifications)[0]) => {
    if (!notif.read) {
      try {
        await markRead.mutateAsync(notif.id);
      } catch {
        // ignore
      }
    }
    navigate("browse");
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-charcoal px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white">Notifications</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              data-ocid="notifications.mark_all.button"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="text-carry-blue hover:text-carry-blue hover:bg-white/10 text-xs font-semibold rounded-full px-3"
            >
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <div className="px-5 pt-5 space-y-3">
        {isLoading ? (
          <div className="space-y-3" data-ocid="notifications.loading_state">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="notifications.empty_state"
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <BellOff size={28} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll notify you when there's a match on your route
              </p>
            </div>
          </motion.div>
        ) : (
          notifications.map((notif, i) => (
            <motion.div
              key={String(notif.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`notifications.item.${i + 1}`}
              onClick={() => handleNotificationClick(notif)}
              className={`bg-white rounded-2xl p-4 shadow-card border cursor-pointer transition-all active:scale-[0.98] ${
                notif.read
                  ? "border-border"
                  : "border-carry-blue/30 bg-blue-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.read ? "bg-muted" : "bg-carry-blue/10"
                  }`}
                >
                  {notif.notificationType === "tripMatch" ? (
                    <Plane
                      size={16}
                      className={
                        notif.read ? "text-muted-foreground" : "text-carry-blue"
                      }
                    />
                  ) : (
                    <Package
                      size={16}
                      className={
                        notif.read ? "text-muted-foreground" : "text-carry-blue"
                      }
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${
                      notif.read
                        ? "text-foreground"
                        : "font-bold text-foreground"
                    }`}
                  >
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(notif.timestamp)}
                    </span>
                    {(notif.relatedParcelIndex !== undefined ||
                      notif.relatedTripIndex !== undefined) && (
                      <span
                        data-ocid={`notifications.view.button.${i + 1}`}
                        className="text-xs font-semibold text-carry-blue"
                      >
                        View →
                      </span>
                    )}
                  </div>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-carry-blue flex-shrink-0 mt-1" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
