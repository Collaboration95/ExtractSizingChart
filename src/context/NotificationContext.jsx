// NotificationContext.js
import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const timeoutSeconds = 10;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info", timeout = timeoutSeconds*1000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);


    setTimeout(() => {
      removeNotification(id);
    }, timeout);
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};