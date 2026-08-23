import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import shareRoutes from './routes/shares';
import auditRoutes from './routes/auditLogs';
import analyticsRoutes from './routes/analytics';
import policyRoutes from './routes/policies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SecureDocs AI Core API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/policies', policyRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 SecureDocs AI Server listening on port ${PORT}`);
  });
}

export default app;
