import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { ConnectWallet } from "../components/WebUtils";
import Message from "../components/Messages"; // Importă componenta Message
import "../styles/Contact.css";
import socketIOClient from "socket.io-client";
import DOMPurify from "dompurify";
import { validateMessage } from "../components/validationUtils"; // Importăm funcția de validare

const ENDPOINT = process.env.REACT_APP_ENDPOINT;
const socket = socketIOClient(ENDPOINT);
console.log(ENDPOINT);

function Contact() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [contacts, setContacts] = useState([]);
  const scrollRef = useRef();

  const [rooms] = useState({
    general: "",
    room1: 1,
    room2: 2,
    room3: 3,
  });

  const [selectedRoom, setSelectedRoom] = useState("");

  // Funcție pentru setarea unui cookie
  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/`;
  };

  // Funcție pentru preluarea unui cookie
  const getCookie = (name) => {
    return document.cookie.split("; ").reduce((r, v) => {
      const parts = v.split("=");
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
  };

  const joinRoom = useCallback((roomNumber) => {
    socket.emit("join_room", roomNumber);
    setContacts([]);
    setSelectedRoom(roomNumber);
    setCookie("selectedRoom", roomNumber, 7); // Setează cookie-ul pentru room-ul selectat
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${ENDPOINT}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const connectedUser = await ConnectWallet();
        setUser(connectedUser);
      } catch (error) {
        console.error("Failed to connect wallet:", error.message);
      }
    };

    // Preluarea room-ului din cookie la încărcarea componentului
    const savedRoom = getCookie("selectedRoom");
    if (savedRoom) {
      setSelectedRoom(savedRoom);
      joinRoom(savedRoom);
    }

    fetchUser();
    fetchContacts();

    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      console.log("Current room:", selectedRoom);
      if (selectedRoom === "" || newMessage.room === selectedRoom) {
        setContacts((prevContacts) => [
          ...prevContacts,
          {
            ...newMessage,
            entryDate: new Date().toISOString(),
            _id: Date.now().toString(),
          },
        ]);
      }
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact._id !== deletedMessageId)
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageDeleted");
    };
  }, [joinRoom, selectedRoom]);

  const axiosPostData = async () => {
    const sanitizedMessage = DOMPurify.sanitize(message);
    const { valid, error } = validateMessage(sanitizedMessage); // Validăm mesajul folosind funcția externă

    if (!valid) {
      setError(<p className="error">{error}</p>);
      return;
    }

    try {
      const res = await axios.post(`${ENDPOINT}/contact/send`, {
        user,
        message: sanitizedMessage,
        room: selectedRoom,
      });
      setError(<p className="success">{res.data}</p>);
      socket.emit(
        "sendMessage",
        { user, message: sanitizedMessage, room: selectedRoom },
        (response) => {
          console.log("Server response:", response);
          fetchContacts();
        }
      );
    } catch (err) {
      setError(<p className="error">Error sending message</p>);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { valid, error } = validateMessage(message); // Validăm mesajul înainte de trimitere

    if (!valid) {
      setError(<p className="error">{error}</p>);
      return;
    }

    axiosPostData();
    setMessage("");
    setError("");
  };

  const handleCopyUser = (user) => {
    navigator.clipboard
      .writeText(user)
      .then(() => {})
      .catch((err) => {});
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(`${ENDPOINT}/contact/${messageId}`);
      console.log("Message deleted:", res.data);
      fetchContacts(); // Reîncarcă mesajele după ștergere
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [contacts]);

  return (
    <div className="chatContainer">
      <div className="roomSelector">
        <select value={selectedRoom} onChange={(e) => joinRoom(e.target.value)}>
          {Object.keys(rooms).map((key) => (
            <option key={key} value={rooms[key]}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div className="chatBox">
        <div className="chatBoxWrapper">
          <div className="chatBoxTop">
            {contacts
              .filter(
                (contact) =>
                  selectedRoom === "" || contact.room === selectedRoom
              )
              .map((contact) => (
                <div className="chatMessage" key={contact._id}>
                  <Message
                    contact={contact}
                    user={user}
                    room={selectedRoom}
                    handleCopyUser={handleCopyUser}
                    handleDeleteMessage={handleDeleteMessage} // Trimite funcția de ștergere a mesajului
                    scrollRef={scrollRef}
                  />
                </div>
              ))}
            <div ref={scrollRef}></div>
          </div>
        </div>
      </div>
      <div className="contactForm">
        <input
          type="hidden"
          id="user"
          name="user"
          value={user || ""}
          readOnly
        />
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength="100"
        />
        <div className="error-message">{error}</div>
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Contact;
