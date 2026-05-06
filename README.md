# VA Bot Analytics - Enterprise Dashboard

VA Bot is an enterprise-grade AI-powered logistics and warehouse analytics dashboard. It combines a modern, high-performance React frontend with an intelligent Python Flask backend powered by a local Ollama LLM. The platform allows stakeholders to instantly visualize complex supply chain metrics, predict stockouts, and query operational data using natural language.

## 🌟 Key Features

### 1. Natural Language Data Querying & Dynamic Visuals
The core feature of VA Bot is its integrated AI Assistant. Instead of just returning text, the bot dynamically generates **real-time, interactive Chart.js visualizations** right inside the chat window. 
- Ask questions like: *"Can you make a scatter plot comparing our forecasted demand versus actual daily demand?"*
- The LLM parses the SQLite database, generates valid JSON configurations, and the frontend renders live Bar, Pie, Scatter, or Doughnut charts.

### 2. High-Density Operations Dashboard
A beautifully designed, corporate (Vdart-branded) interface built for C-Level executives and warehouse managers.
- **Top KPI Layer:** Real-time metrics for Total Inventory Value, Fulfillment Rates, and Stockout Risk.
- **Inventory & Demand Analytics:** Advanced Chart.js visuals, including Stock Level Distributions, Lead Time vs. Buffer metrics, and historical demand trends.
- **Business Logic Tables:** "Zone Efficiency" trackers with inline progress bars and "Turnover Anomaly" lists to detect dead stock or high-demand items.

## 🛠️ Technology Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS (Custom Enterprise Vdart Theme)
- Chart.js & React-Chartjs-2
- React Markdown

**Backend:**
- Python 3.11 + Flask
- SQLite3 (In-memory/local data processing)
- Ollama (Local LLM Integration)
- Pandas (Data Processing)

## 🚀 Getting Started

To run this project locally, you need three separate terminal instances:

### 1. Start the Local AI Server (Ollama)
You must have [Ollama](https://ollama.ai/) installed locally.
```bash
ollama serve
```

### 2. Start the Python Backend
The backend processes data and communicates with the LLM.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python3 app.py
```
*(The server will run on `http://127.0.0.1:5001`)*

### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*(The UI will run on `http://localhost:5173`)*

## 🧪 Testing the AI
Once everything is running, open the chat bubble in the bottom right corner of the dashboard. 
You can use the prompts provided in `prompt.txt` to test the AI's ability to generate charts and insights.

---
*Built for modern supply chain analytics.*
