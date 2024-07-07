import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ConnectWallet } from "../components/WebUtils";
import Message from "../components/Messages";
import "../styles/Contact.css";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT);

function Contact() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [contacts, setContacts] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const connectedUser = await ConnectWallet();
        setUser(connectedUser);
      } catch (error) {
        console.error("Failed to connect wallet:", error.message);
      }
    };

    const fetchContacts = async () => {
      try {
        const response = await axios.get("http://localhost:4000/contacts");
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchUser();
    fetchContacts();

    socket.on("newMessage", (newMessage) => {
      setContacts((prevContacts) => [
        ...prevContacts,
        {
          ...newMessage,
          entryDate: new Date().toISOString(),
          _id: Date.now().toString(),
        },
      ]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const axiosPostData = async () => {
    const postData = { user, message };

    try {
      const res = await axios.post(
        "http://localhost:4000/contact/send",
        postData
      );
      setError(<p className="success">{res.data}</p>);
      socket.emit("sendMessage", postData);
    } catch (err) {
      setError(<p className="error">Error sending message</p>);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message) {
      setError(
        <p className="required">Message is empty. Please type a message.</p>
      );
    } else {
      setError("");
      axiosPostData();
      setMessage("");
    }
  };

  const handleCopyUser = (user) => {
    navigator.clipboard
      .writeText(user)
      .then(() => {})
      .catch((err) => {});
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [contacts]);

  return (
    <div className="chatContainer">
      <div className="chatBox">
        <div className="chatBoxWrapper">
          <div className="chatBoxTop">
            {contacts.map((contact) => (
              <div className="chatMessage" key={contact._id}>
                <Message
                  key={contact._id}
                  contact={contact}
                  user={user}
                  handleCopyUser={handleCopyUser}
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
        />
        <div class="error-message">{error}</div>
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Contact;
