## Authentication Routes

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user profile
- PUT /api/auth/me - Update user profile



## Job Listing Routes

- POST /api/job-listings - Submit a job listing URL and extract data
- GET /api/job-listings - Get all job listings for current user
- GET /api/job-listings/:id - Get a specific job listing
- PUT /api/job-listings/:id - Update job listing details
- DELETE /api/job-listings/:id - Delete a job listing

## Interview Routes

- POST /api/interviews - Create a new interview based on job listing and resume
- GET /api/interviews - Get all interviews for current user
- GET /api/interviews/:id - Get a specific interview

## Interview Session (Attempt) Routes

- POST /api/interview-sessions - Start a new interview session
- PUT /api/interview-sessions/:id - Update interview session state (camera/mic toggles)
- PUT /api/interview-sessions/:id/end - End an interview session
- GET /api/interview-sessions - Get all interview sessions for current user
- GET /api/interview-sessions/:id - Get a specific interview session details

## Question and Response Routes

- GET /api/interviews/:id/questions - Get all questions for an interview
- POST /api/interview-sessions/:id/responses - Submit a response to a question
- GET /api/interview-sessions/:id/responses - Get all responses for a session

## Chat Routes

- POST /api/interview-sessions/:id/chat - Send a chat message
- GET /api/interview-sessions/:id/chat - Get chat history for a session

## Interview Results Routes

- GET /api/interview-results - Get all results for current user
- GET /api/interview-results/:id - Get specific result with detailed metrics
- POST /api/interview-results - Generate result (may be called by backend after session ends)

## Miscellaneous Routes

- GET /api/metrics/user - Get user statistics (completed interviews, average score, etc.)
