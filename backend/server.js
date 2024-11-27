const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const Message = require("./models/Message");

dotenv.config({ path: './mern-chat-app/.env' }); // Load environment variables from .env file

const app = express();
const httpServer = createServer(app);

// Set up Socket.io server with CORS options
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow any origin (use a specific origin in production)
    methods: ["GET", "POST"],
  },
});

// Use middleware
app.use(cors()); // CORS middleware for Express API
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Use the auth routes for user authentication
app.use(authRoutes);

// Basic route for server status
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// In-memory object to store online users
const onlineUsers = {};

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining the chat
  socket.on("join", (userId) => {
    // Store the user as online
    onlineUsers[socket.id] = userId; // Map socket id to user id

    console.log(`${userId} joined the chat`);
    // Emit the updated list of online users
    io.emit("online_users", getOnlineUsers());
  });

  // Handle incoming messages from the client
  socket.on("send_message", async (data) => {
    const { senderId, content } = data;

    try {
      // Save the message in the database
      const message = await Message.create({ sender: senderId, content });

      // Emit the message to all connected clients
      io.emit("receive_message", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnections
  socket.on("disconnect", () => {
    const userId = onlineUsers[socket.id];
    delete onlineUsers[socket.id]; // Remove user from the online users list
    console.log(`User ${userId} disconnected`);

    // Emit the updated list of online users after a user disconnects
    io.emit("online_users", getOnlineUsers());
  });
});

// Function to get the list of online users (extract from the socket ids)
const getOnlineUsers = () => {
  // Extract user IDs from the onlineUsers object and return them as a list
  return Object.values(onlineUsers); // This will give you an array of user IDs
};

// Start the server on the specified port
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
