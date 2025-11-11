import * as React from 'react';
import type { Notification } from '../types';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (ids: number[] | 'all') => void;
}

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-white";
    switch (type) {
        case 'stock': return <div className={`${baseClasses} bg-green-500`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>;
        case 'price': return <div className={`${baseClasses} bg-yellow-500`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div>;
        case 'order': return <div className={`${baseClasses} bg-blue-500`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" /></svg></div>;
        case 'review': return <div className={`${baseClasses} bg-yellow-500`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568L24 9.423l-6 5.845L19.335 24 12 19.725 4.665 24 6 15.268l-6-5.845 7.332-1.268L12 .587z" /></svg></div>;
        default: return <div className={`${baseClasses} bg-gray-500`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" /></svg></div>;
    }
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onMarkAsRead }) => {
    
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            onMarkAsRead([notification.id]);
        }
        onClose();
    };

    const handleMarkAllAsRead = () => {
        onMarkAsRead('all');
    };
    
    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg z-30 ring-1 ring-black ring-opacity-5 animate-fade-in-up origin-top-right">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <a 
                            key={notification.id} 
                            href={notification.link} 
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-start p-3 gap-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                            {!notification.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>}
                            <div className="flex-shrink-0 pt-1">
                                <NotificationIcon type={notification.type} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{notification.title}</p>
                                <p className="text-gray-600 text-sm">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeSince(notification.timestamp)}</p>
                            </div>
                        </a>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No new notifications.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;