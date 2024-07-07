import "./App.css";
import React, { useState, useEffect } from "react";
import Router from "./components/Router";
import Context from "./components/Context";
import { ConnectWallet } from "./components/WebUtils"; // Importăm funcția connectWallet

function App() {
  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const connectedUser = await ConnectWallet();
        setUser(connectedUser);
      } catch (error) {
        console.error("Failed to connect wallet:", error.message);
        // Poți trata eroarea în funcție de necesități (afisând un mesaj, etc.)
      }
    };

    fetchUser();
  }, []);

  const userInfo = {
    user: user,
  };

  return (
    <>
      <Context.Provider value={userInfo}>
        <Router user={user} />
      </Context.Provider>
    </>
  );
}

export default App;
