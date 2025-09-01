import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import authService from "../services/authService";
import Message from "./message";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const storedMessages = JSON.parse(localStorage.getItem("messages"));
    if (storedMessages) {
      setMessages(storedMessages);
    }

    const socketInstance = io("https://mern-chat-app-1-8vqd.onrender.com");

    // Receive messages
    socketInstance.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Online users
    socketInstance.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    // Join with full object
    socketInstance.emit("join", { id: user.id, username: user.username });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      const data = {
        senderId: user.id,
        senderName: user.username,
        content: message,
      };
      socket.emit("send_message", data);
      setMessage("");
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    authService.logout();
    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Welcome, {user.username}!</h2>
        <button
          className="bg-red-500 p-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="flex-grow p-4">
        <h3 className="text-xl font-semibold mb-2">Online Users</h3>
        <ul className="list-disc pl-6">
          {onlineUsers.map((onlineUser, idx) => (
            <li key={idx} className="mb-1 text-lg">
              {onlineUser}
            </li>
          ))}
        </ul>

        <div className="bg-white p-4 rounded-lg shadow-lg mt-4 h-72 overflow-auto">
          <h3 className="text-xl font-semibold mb-2">Chat Room</h3>
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender={msg.senderName}
              content={msg.content}
            />
          ))}
        </div>

        <div className="mt-4 flex">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-l-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 p-2 text-white rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
