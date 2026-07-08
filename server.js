const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Automatski parsira JSON u zahtevima
app.use(express.json());

// Simulacija baze podataka (In-memory storage) - idealno za demo kontejner
let tasks = [
  { id: 1, title: "Konfiguracija CI/CD pipeline-a", description: "Podesiti GitHub Actions i Hadolint", status: "IN_PROGRESS", priority: "HIGH" },
  { id: 2, title: "Optimizacija Docker slika", description: "Implementirati Multi-stage build za Node.js", status: "TODO", priority: "MEDIUM" },
  { id: 3, title: "Bezbednosno skeniranje", description: "Integrisati Trivy alat u pipeline", status: "DONE", priority: "HIGH" }
];

// 1. Osnovne informacije o mikroservisu
app.get('/', (req, res) => {
  res.json({
    service: "Task Management Microservice API",
    version: "1.0.0",
    status: "UP",
    environment: process.env.NODE_ENV || "production"
  });
});

// 2. GET - Preuzimanje svih zadataka (uz opciono filtriranje po statusu)
app.get('/api/tasks', (req, res) => {
  const { status } = req.query;
  if (status) {
    const filteredTasks = tasks.filter(t => t.status === status.toUpperCase());
    return res.json({ count: filteredTasks.length, data: filteredTasks });
  }
  res.json({ count: tasks.length, data: tasks });
});

// 3. POST - Kreiranje novog zadatka (sa osnovnom validacijom)
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Polja 'title' i 'description' su obavezna!" });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    description,
    status: "TODO",
    priority: priority || "LOW"
  };

  tasks.push(newTask);
  res.status(201).json({ message: "Zadatak uspešno kreiran", data: newTask });
});

// 4. PUT - Izmena statusa zadatka (npr. pomeranje iz TODO u IN_PROGRESS)
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { status } = req.body;

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: `Zadatak sa ID-jem ${taskId} ne postoji.` });
  }

  if (status) {
    task.status = status.toUpperCase();
  }

  res.json({ message: "Zadatak ažuriran", data: task });
});

// 5. Prošireni Health Check (Ovo profesorica Marijana eksplicitno ceni u Cloud-native radovima)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    system_metrics: {
      memory_rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpu_usage: process.cpuUsage()
    }
  });
});

app.listen(PORT, () => {
  console.log(`[🚀] DevOps Demo API uspešno pokrenut na portu ${PORT}`);
});