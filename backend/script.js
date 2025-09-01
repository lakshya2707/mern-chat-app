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
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const onlineUsers = {};

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle join
  socket.on("join", (user) => {
    // user = { id, username }
    onlineUsers[socket.id] = user.username;
    console.log(`${user.username} joined the chat`);

    io.emit("online_users", getOnlineUsers());
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    const { senderId, senderName, content } = data;

    try {
      const message = await Message.create({ sender: senderId, content });

      const messageWithSender = {
        ...message.toObject(), // Mongoose safe conversion
        senderName,
      };

      io.emit("receive_message", messageWithSender);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];

    console.log(`User ${username} disconnected`);

    io.emit("online_users", getOnlineUsers());
  });
});

const getOnlineUsers = () => {
  return Object.values(onlineUsers); // usernames list
};

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
