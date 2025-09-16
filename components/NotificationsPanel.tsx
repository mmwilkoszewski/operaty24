import React from 'react';
import { Notification } from '../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  onNavigate: (link: NonNullable<Notification['link']>) => void;
}

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " lat temu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " mies. temu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dni temu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " godz. temu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min. temu";
  return "przed chwilą";
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onNavigate }) => {

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead(notification.id);
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="absolute top-16 right-4 w-80 max-w-sm bg-white rounded-lg shadow-xl border z-50 animate-fade-in">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-800">Powiadomienia</h3>
        {hasUnread && (
            <button
            onClick={onMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
            Oznacz wszystkie jako przeczytane
            </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center p-4">Brak nowych powiadomień.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 cursor-pointer transition-colors ${
                  notification.isRead ? 'bg-white' : 'bg-indigo-50'
                } hover:bg-gray-100`}
              >
                <div className="flex items-start space-x-3">
                    {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                    )}
                    <div className={notification.isRead ? 'pl-5' : ''}>
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeSince(new Date(notification.timestamp))}</p>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;