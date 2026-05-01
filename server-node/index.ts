import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Simple In-Memory Cache for S2 Responses
const paperCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 Hour

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

import WebSocket from 'ws';

// ... existing code ...

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
const PYTHON_WS_URL = PYTHON_BACKEND_URL.replace('http', 'ws') + '/ws';

// Connect to Python Backend WebSocket
let pythonWs: WebSocket;

function connectToPython() {
  pythonWs = new WebSocket(PYTHON_WS_URL);
  
  pythonWs.on('open', () => {
    console.log('[Orchestrator] Connected to Python Swarm WebSocket');
  });

  pythonWs.on('error', (err) => {
    console.error('[Orchestrator] Python WS error:', err.message);
  });

  pythonWs.on('message', (data: string) => {
    try {
      const log = JSON.parse(data);
      if (log.type === 'agent_log') {
        io.emit('agent:log', log);
      }
    } catch (e) {
      console.error('[Orchestrator] Error parsing Python WS message:', e);
    }
  });

  pythonWs.on('close', () => {
    console.log('[Orchestrator] Python WS disconnected. Retrying in 5s...');
    setTimeout(connectToPython, 5000);
  });
}

connectToPython();

// Socket.io for real-time agent logging
io.on('connection', (socket) => {
  console.log('Client connected to orchestrator');
  
  socket.on('agent:query', async (payload) => {
    const { query, id } = payload;
    
    // 1. Dispatch to Orchestrator Logic
    io.emit('agent:log', { message: `Initializing swarm for: ${query}`, status: 'loading' });
    
    try {
      // Proxy to Python Research Swarm
      const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/research`, { query });
      
      socket.emit('agent:log', { message: 'Papers found. Extraction lineage...', status: 'loading' });
      
      // 2. Expand Lineage
      const researchData = response.data;
      socket.emit('agent:log', { message: 'Building citation dependency graph...', status: 'loading' });
      
      // 3. Final Result
      socket.emit('agent:result', { 
        id, 
        nodes: researchData.nodes, 
        links: researchData.links,
        summary: researchData.summary 
      });
      
      socket.emit('agent:log', { message: 'System updated. Memory Agent committed changes to Git.', status: 'success' });
      
    } catch (error) {
      console.error('Agent query failed:', error);
      socket.emit('agent:log', { message: 'Agent execution failed. Check backend logs.', status: 'error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/api/paper/:id', async (req, res) => {
  const { id } = req.params;
  
  // Check Cache
  const cached = paperCache.get(id);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.json(cached.data);
  }

  try {
    console.log(`[Orchestrator] Fetching metadata for: ${id} from ${PYTHON_BACKEND_URL}/nodes/${id}`);
    const response = await axios.get(`${PYTHON_BACKEND_URL}/nodes/${id}`);
    
    // Update Cache
    paperCache.set(id, { data: response.data, timestamp: Date.now() });
    
    console.log(`[Orchestrator] Successfully fetched metadata for ${id}`);
    res.json(response.data);
  } catch (error: any) {
    console.error(`[Orchestrator] Failed to fetch paper metadata for ${id}:`, error.response?.status || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch paper metadata' });
  }
});

app.post('/api/agent/expand', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/expand`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Expansion failed' });
  }
});

app.post('/api/agent/summarize', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/summarize`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Summarization failed' });
  }
});

app.post('/api/agent/qa', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/qa`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Q&A failed' });
  }
});

app.post('/api/agent/cluster', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/cluster`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Clustering failed' });
  }
});

app.post('/api/agent/run', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/run`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Autonomous loop failed' });
  }
});

app.post('/api/agent/synthesis', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/synthesis`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Synthesis failed' });
  }
});

app.post('/api/agent/recommend', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/recommend`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Recommendation failed' });
  }
});

app.post('/api/agent/reproduce', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/reproduce`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Reproduction failed' });
  }
});

app.post('/api/agent/literature-review', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/literature-review`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Literature review failed' });
  }
});

app.post('/api/agent/experiment-design', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/experiment-design`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Experiment design failed' });
  }
});

app.get('/api/nodes', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_BACKEND_URL}/nodes`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

app.post('/api/nodes/create', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/nodes/create`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// MISSION CONTROL PROXY
app.post('/api/mission/start', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/mission/start`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start mission' });
  }
});

app.get('/api/mission/status', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_BACKEND_URL}/mission/status`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mission status' });
  }
});

app.post('/api/mission/stop', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/mission/stop`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop mission' });
  }
});

// SYNTHESIS PROXY
app.post('/api/agent/synthesis/generate', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND_URL}/agent/synthesis/generate`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Synthesis failed' });
  }
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Node Orchestrator running on http://0.0.0.0:${PORT}`);
});
