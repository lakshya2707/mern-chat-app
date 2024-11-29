const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const Message = require("./models/Message");

dotenv.config(); 

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

app.use(cors()); 
app.use(express.json()); 

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers[socket.id] = userId[1];
    console.log(`${userId[1]} joined the chat`);
    // Emit the updated list of online users
    io.emit("online_users", getOnlineUsers());
  });

  // Handle incoming messages from the client
  socket.on("send_message", async (data) => {
    const { senderId,senderName, content } = data;

    try {
      // Save the message in the database (including senderId for tracking)
      const message = await Message.create({ sender: senderId, content });
  
      // Include senderName in the message object
      const messageWithSender = {
        ...message.toJSON(), // Convert Sequelize model to plain object
        senderName,
      };
  
      // Emit the message to all connected clients
      io.emit("receive_message", messageWithSender);
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
