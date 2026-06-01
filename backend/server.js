import exp from 'express';
import cors from 'cors';
import {config} from 'dotenv';
import {auth} from './routes/Auth.js';
import {connect} from 'mongoose';
import {tripRouter} from './routes/TripAPI.js';
import {itineraryRouter} from './routes/ItineraryAPI.js';
import { pollRouter } from './routes/PollAPI.js';
import { expenseRouter } from './routes/ExpenseAPI.js';
import {photoRouter} from './routes/PhotosAPI.js';
const result = config();
console.log(result);

const app = exp();
app.use(cors({ origin: 'http://localhost:5173',
    credentials: true

}));
app.use(exp.json());

app.use('/auth',auth);
app.use('/trip',tripRouter);
app.use('/itinerary',itineraryRouter);
app.use('/poll',pollRouter);
app.use('/expense',expenseRouter);
app.use('/photo',photoRouter);



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

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

//after DB connect server should run
startServer();



