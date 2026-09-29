import React from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  franchiseId: string;
  onRefresh: () => void;
  onSelectTarget?: (targetId: string, type: string) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  franchiseId,
  onRefresh,
  onSelectTarget,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await SidTechDatabase.markAllNotificationsRead(franchiseId);
    onRefresh();
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await SidTechDatabase.markNotificationRead(notif.notifId);
      onRefresh();
    }
    if (notif.targetId && onSelectTarget) {
      onSelectTarget(notif.targetId, notif.type);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-[#12294A] text-white px-4 py-3 flex items-center justify-between border-b border-[#E86A17]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#E86A17]" />
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-[#E86A17] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-orange-200 hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>
      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 20).map((notif) => (
            <div
              key={notif.notifId}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 hover:bg-slate-50 transition cursor-pointer text-xs flex items-start gap-3 ${
                !notif.read ? 'bg-orange-50/40 font-medium' : 'text-slate-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  !notif.read ? 'bg-[#E86A17]' : 'bg-slate-300'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 leading-snug line-clamp-3">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdOn).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {notif.targetId && (
                    <span className="text-[#E86A17] font-semibold flex items-center gap-0.5">
                      View <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center text-[11px] text-slate-500">
        Real-time alerts delivered via Cloud Database
      </div>
    </div>
  );
};
