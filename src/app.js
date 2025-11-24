const express = require('express');
const { prisma } = require('./prisma');
const cors = require('cors');

const app = express();
const PORT = 3000;

const path = require('path');

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}));
app.use(express.json());

// Serve static frontend (files placed in src/public)
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Import routes
const authRoutes = require('./routes/auth');
const tenantsRoutes = require('./routes/tenants');
const departmentsRoutes = require('./routes/departments');
const lecturersRoutes = require('./routes/lecturers');
const programsRoutes = require('./routes/programs');
const researchProjectsRoutes = require('./routes/researchProjects');
const newsRoutes = require('./routes/news');
const eventsRoutes = require('./routes/events');
const achievementsRoutes = require('./routes/achievements');
const dashboardRoutes = require('./routes/dashboard');
const subscriptionsRoutes = require('./routes/subscriptions');
const plansRoutes = require('./routes/plans');
const templatesRoutes = require('./routes/templates');
const tenantTemplatesRoutes = require('./routes/tenantTemplates');
const tenantTemplatesCustomRoutes = require('./routes/tenantTemplatesCustom');
const customTemplatesRoutes = require('./routes/customTemplates');
// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/lecturers', lecturersRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/research-projects', researchProjectsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/tenant-templates', tenantTemplatesRoutes);
app.use('/api/tenant-templates', tenantTemplatesCustomRoutes);
app.use('/api/custom-templates', customTemplatesRoutes);

// Public preview route (friendly URL)
const tenantTemplatesController = require('./controllers/tenantTemplatesController');
app.get('/tenant-preview/:slug', tenantTemplatesController.previewBySlug);
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PostgreSQL API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
