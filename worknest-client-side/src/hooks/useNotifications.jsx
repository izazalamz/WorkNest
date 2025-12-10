import { useNotification } from '../contexts/NotificationContext';

const useNotifications = () => {
  const {
    notifications,
    showNotification,
    createNotification,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    checkReminders,
    sendBookingConfirmation,
    sendBookingReminder,
    sendBookingAlert,
  } = useNotification();

  return {
    notifications,
    showNotification,
    createNotification,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    checkReminders,
    sendBookingConfirmation,
    sendBookingReminder,
    sendBookingAlert,
  };
};

export default useNotifications;
