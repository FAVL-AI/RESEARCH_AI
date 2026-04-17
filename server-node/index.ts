import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

// Socket.io for real-time agent logging
io.on('connection', (socket) => {
  console.log('Client connected to orchestrator');
  
  socket.on('agent:query', async (payload) => {
    const { query, id } = payload;
    
    // 1. Dispatch to Orchestrator Logic
    socket.emit('agent:log', { message: 'Searching ArXiv and Semantic Scholar...', status: 'loading' });
    
    try {
      // Proxy to Python Research Agent
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

// Proxy routes to Python backend
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

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Node Orchestrator running on http://localhost:${PORT}`);
});
