import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import config from './config/env.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();
const app = express();
connectDB();
app.use(express.json());
// Use the authentication routes
app.use('/api/auth', authRoutes);
// Placeholder route
app.get('/', (req, res) => {
    res.send('Connect Sphere Backend is running!');
});
app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});
//# sourceMappingURL=index.js.map