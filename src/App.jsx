import Header from "./components/Header";
import DragAndDropImage from "./components/DragandDrop";
import "./index.css";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationList from "./components/NotificationList";
function App() {
  return (
    <>
      <NotificationProvider>
        <NotificationList />
        <Header />
        <DragAndDropImage />
      </NotificationProvider>
    </>
  );
}

export default App;
