import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/db.config.js';
import config from './config/env.config.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();


connectDB();

app.use(express.json());
app.use(bodyParser.json());

// Use the authentication routes
app.use('/api/auth', authRoutes);

// Placeholder route
// app.get('/', (req, res) => {
//   res.send('Connect Sphere Backend is running!');
// });

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
