import React from "react";
import { format } from "date-fns";
import "../styles/Message.css"; // Asigură-te că ai stilurile pentru mesaje definite

const Message = ({ contact, user, room, handleCopyUser, scrollRef }) => {
  const isSentMessage = contact.user === user;

  const formatUserName = (username) => {
    if (username === user) {
      return "You";
    }
    if (username.length <= 10) {
      return username;
    }
    return `${username.slice(0, 5)}...${username.slice(-5)}`;
  };

  return (
    <div
      ref={scrollRef}
      className={isSentMessage ? "sentMessage" : "receivedMessage"}
    >
      <div className="userInfo">
        <strong>{formatUserName(contact.user)}</strong>
        <button
          className="copyButton"
          onClick={() => handleCopyUser(contact.user)}
        />
        <br />
        <em className="dateOn">
          {format(new Date(contact.entryDate), "dd MMMM yyyy, HH:mm")}
        </em>
      </div>
      <div className="messageContent">{contact.message}</div>
      {/* <div className="messageContent">room: {contact.room}</div> */}
    </div>
  );
};

export default Message;
