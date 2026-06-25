import exp from 'express';
import cors from 'cors';
import {config} from 'dotenv';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {auth} from './routes/Auth.js';
import {connect} from 'mongoose';
import {tripRouter} from './routes/TripAPI.js';
import {itineraryRouter} from './routes/ItineraryAPI.js';
import { pollRouter } from './routes/PollAPI.js';
import { expenseRouter } from './routes/ExpenseAPI.js';
import {photoRouter} from './routes/PhotosAPI.js';
import messageRouter from './routes/MessageRoutes.js';
import {setupSocket} from './socket/socketHandler.js';

const result = config();
console.log(result);

const app = exp();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://trip-sync-sage.vercel.app'
  ].filter(Boolean),
  credentials: true
}));
app.use(exp.json());

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with CORS and robust transports
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://trip-sync-sage.vercel.app'
    ].filter(Boolean),
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// Expose Socket.IO instance to routes
app.set('socketio', io);

// Routes
app.use('/auth',auth);
app.use('/trip',tripRouter);
app.use('/itinerary',itineraryRouter);
app.use('/poll',pollRouter);
app.use('/expense',expenseRouter);
app.use('/photo',photoRouter);
app.use('/api/messages', messageRouter);

// Set up Socket.IO event handling
setupSocket(io);

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});

//assign port number
const port = process.env.PORT || 4000

let isConnected = false

//connect to DB
const connectDB = async () => {
    if (isConnected) return
    try {
        await connect(process.env.DB_URL)
        isConnected = true
        console.log("DB connected")
    } catch (err) {
        console.error("DB connection error:", err.message)
        process.exit(1); 
    }
};

//call DB to connect then server should run
const startServer = async () => {
    await connectDB();

    httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

//after DB connect server should run
startServer();




