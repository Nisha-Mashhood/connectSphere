import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/db.config.js';
import config from './config/env.config.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import subCategoryRoutes from './routes/sucategory.routes.js';
import skillsRoutes from './routes/skills.routes.js';

dotenv.config();

const app = express();


connectDB();

app.use(express.json());
app.use(bodyParser.json());

// Use the authentication routes
app.use('/api/auth', authRoutes);

// Use the authentication routes
app.use('/api/category', categoryRoutes);

// Use the authentication routes
app.use('/api/subcategory', subCategoryRoutes);

// Use the authentication routes
app.use('/api/skills', skillsRoutes);


// Placeholder route
// app.get('/', (req, res) => {
//   res.send('Connect Sphere Backend is running!');
// });

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
