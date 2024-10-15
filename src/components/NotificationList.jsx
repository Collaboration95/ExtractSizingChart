
import React from "react";
import { useNotification } from "../context/NotificationContext";
import { Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotificationList = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 space-y-4 w-full max-w-sm">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <Alert
            severity={notification.type}
            action={
              <IconButton
                size="small"
                onClick={() => removeNotification(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
