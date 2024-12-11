import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(express.json());
// Placeholder route
app.get('/', (req, res) => {
    res.send('Connect Sphere Backend is running!');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map