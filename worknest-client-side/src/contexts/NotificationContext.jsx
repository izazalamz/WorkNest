import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const response = await axios.post('http://localhost:3000/notifications', notificationData);
      setNotifications(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notifications/${id}`);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    // This could be implemented with a toast library or similar
    console.log(`Notification: ${message} (${type})`);
  };

  const checkReminders = async () => {
    // Logic to check for reminders
    console.log('Checking reminders...');
  };

  const sendBookingConfirmation = async (bookingData) => {
    try {
      await createNotification({
        title: 'Booking Confirmed',
        message: `Your booking for ${bookingData.desk} has been confirmed.`,
        type: 'booking',
        userId: bookingData.userId,
      });
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  };

  const sendBookingReminder = async (bookingData) => {
    try {
      await createNotification({
        title: 'Booking Reminder',
        message: `Reminder: Your booking for ${bookingData.desk} is coming up.`,
        type: 'reminder',
        userId: bookingData.userId,
      });
    } catch (error) {
      console.error('Error sending booking reminder:', error);
    }
  };

  const sendBookingAlert = async (bookingData) => {
    try {
      await createNotification({
        title: 'Booking Alert',
        message: `Alert: Issue with your booking for ${bookingData.desk}.`,
        type: 'alert',
        userId: bookingData.userId,
      });
    } catch (error) {
      console.error('Error sending booking alert:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const value = {
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

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


