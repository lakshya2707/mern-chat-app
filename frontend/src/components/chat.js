import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import authService from "../services/authService";
import Message from "./message";
// Chat Component
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      window.location.href = "/login"; // Redirect to login page
      return;
    }
    const storedMessages = JSON.parse(localStorage.getItem("messages"));
    if (storedMessages) {
      setMessages(storedMessages); // Set messages from localStorage
    }

    const socket = io("http://localhost:5000/");

    // Listen for incoming messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Listen for online users
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    // Emit 'join' event to notify server when user connects
    socket.emit("join", [user.id,user.username]);

    // Store socket instance to clean up on unmount
    setSocket(socket);

    // Clean up socket connection when component is unmounted
    return () => {
      socket.disconnect();
    };
  }, [user]);
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);
  // Send a message
  const handleSendMessage = () => {
    if (message.trim()) {
      const data = {
        senderId: user.id,
        senderName: user.username,
        content: message,
      };
      socket.emit("send_message", data);
      setMessage(""); // Clear input field
    }
  };
  // for future building of history componenet.
  // //const fetchMessages = async () => {
  // //   try {
  // //     const response = await authService.fetchMessages();  // Assuming fetchMessages is async
  // //     console.log(response.data)
  // //     // Check if 'response' and 'response.data' are valid
  // //     if (response && Array.isArray(response.data.messages)) {
  // //       setMessages((prevMessages) => [...prevMessages, ...response.data.messages]); // Correctly update the state
  // //     } else {
  // //       console.error('Invalid response structure:', response);
  // //     }
  // //   } catch (error) {
  // //     console.error("Error fetching messages:", error);
  // //   }
  // // };
  // Handle user logout
  const handleLogout = () => {
    if (socket) {
      socket.disconnect(); // Disconnect socket when logging out
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
          {onlineUsers.map((onlineUser) => (
            <li key={onlineUser} className="mb-1 text-lg">{onlineUser}</li>
          ))}
        </ul>

        <div className="bg-white p-4 rounded-lg shadow-lg mt-4 h-72 overflow-auto">
          <h3 className="text-xl font-semibold mb-2">Chat Room</h3>
          {messages.map((msg, index) => (
            <Message key={index} sender={msg.senderName} content={msg.content} />
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
