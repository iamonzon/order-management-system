import express from 'express';
import helmet from 'helmet';
import cors from 'cors'
import morgan from 'morgan';
import { createRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';
import { container } from './core/container';
const app = express();

// Security
app.use(helmet());
app.use(cors())

// Monitoring
app.use(morgan('combined'))

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', createRoutes(container))

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

export default app;