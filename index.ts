import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import jobListingRoutes from './routes/job-listing.routes';
import interviewRoutes from './routes/interview.routes';
import interviewSessionRoutes from './routes/interview-session.rotues';
import questionRoutes from './routes/question.routes';
import responseRoutes from './routes/response.routes';
import chatRoutes from './routes/chat.routes';
import interviewResultRoutes from './routes/interview-result.routes';
import userMetricsRoutes from './routes/user-metric.routes';
import dotenv from "dotenv"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-listings', jobListingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview-sessions', interviewSessionRoutes);
app.use('/api/interview-results', interviewResultRoutes);
app.use('/api/metrics', userMetricsRoutes);


app.use('/api/interviews/:id/questions', questionRoutes);
app.use('/api/interview-sessions/:id/responses', responseRoutes);
app.use('/api/interview-sessions/:id/chat', chatRoutes);




app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;