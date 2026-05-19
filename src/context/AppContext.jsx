/**
 * context/AppContext.jsx
 * Global app state: current user, active page, toast notifications.
 */
import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [page, setPage]   = useState("dashboard");
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const logout = () => { setUser(null); setPage("dashboard"); };

  return (
    <AppContext.Provider value={{ user, setUser, page, setPage, toast, showToast, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
