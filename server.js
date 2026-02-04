import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/egg-prices', (req, res) => {
    const { month, year, type } = req.query;
    console.log(`Fetching data for: ${month}/${year} (${type || 'Daily Rate Sheet'})`);

    const pythonProcess = spawn('python', ['scrape_data.py', month || '01', year || '2026', type || 'Daily Rate Sheet']);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Scraper Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        try {
            const jsonData = JSON.parse(dataString);
            res.json(jsonData);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse scraper output', raw: dataString });
        }
    });
});

// Serve static files from the build directory
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`🥚 NECC API Server running at http://localhost:${port}`);
});
