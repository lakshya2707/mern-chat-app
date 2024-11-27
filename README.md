hi there-
Setting Up Locally
1. Clone the Repository:
Clone the repository to your local machine.
git clone <repository-url>
cd mern-chat-app

2. Install Backend Dependencies:
Navigate to the backend directory and install dependencies.
cd backend
npm install

3. Configure MongoDB:
Make sure you have a MongoDB instance running, either locally or use a service like MongoDB Atlas. Update the .env file with your MongoDB URI:
MONGO_URI=mongodb://<your-mongodb-uri>
PLEASE DO NOT USE MINE :). I have uploaded it though
4. Start the Backend:
In the backend folder, run:
npm start

5. Install Frontend Dependencies:
Navigate to the frontend directory and install dependencies.
cd frontend
npm install

6. Start the Frontend:
In the frontend folder, run:
npm start

Your frontend should now be running at http://localhost:3000/ and your backend at http://localhost:5000/. Well depending upon whether the code contains address of localhost or render in frontend. Please change this address for hosting locally in frontend chat.js and authService.js.
Conclusion
This real-time chat application demonstrates the integration of several technologies:
MERN Stack (MongoDB, Express, React, Node.js) for building full-stack applications.
Socket.io for enabling real-time communication between clients and the server.
JWT Authentication for managing user sessions securely.
