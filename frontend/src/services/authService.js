import axios from "axios";

const API_URL = "https://mern-chat-app-1-8vqd.onrender.com/";

// Register new user
const register = async (username, email, password) => {
  const response = await axios.post(API_URL + "register", {
    username,
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (email, password) => {
  const response = await axios.post(API_URL + "login", { email, password });
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

export default { register, login, logout };
