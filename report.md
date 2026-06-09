# VA Bot: Enterprise Warehouse Analytics & AI Copilot

## 1. Executive Overview
**VA Bot** is a next-generation warehouse intelligence platform designed to bridge the gap between complex logistics data and actionable executive insights. By combining high-performance analytics with a locally-hosted AI Copilot, VA Bot empowers Team Leads and Operations Managers to monitor, analyze, and optimize warehouse performance in real-time using natural language.

---

## 2. திட்டச் சுருக்கம் (Project Summary in Tamil)
**VA Bot** என்பது விடிஆர்ட் (Vdart) நிறுவனத்திற்காக உருவாக்கப்பட்ட ஒரு நவீன கிடங்கு மேலாண்மை மற்றும் தரவு பகுப்பாய்வு மென்பொருள் ஆகும்.

**முக்கிய அம்சங்கள்:**
- **AI சாட்பாட்:** பயனர்கள் கேட்கும் கேள்விகளுக்கு ஆங்கிலம் மற்றும் தமிழில் அறிவார்ந்த பதில்களை வழங்கும்.
- **நேரலை டாஷ்போர்டு:** கிடங்கின் நிலை, சரக்கு இருப்பு மற்றும் செயல்திறனை வரைபடங்கள் மூலம் உடனுக்குடன் காட்டும்.
- **தானியங்கி எச்சரிக்கை:** சரக்கு குறையும் போது அல்லது சிக்கல்கள் ஏற்படும் போது முன்கூட்டியே எச்சரிக்கை செய்யும்.
- **தரவு பாதுகாப்பு:** அனைத்து தரவுகளும் உள்ளூர் சேவையகத்திலேயே (Local Server) சேமிக்கப்படுவதால் முழுமையான பாதுகாப்பு உறுதி செய்யப்படுகிறது.

---

## 3. Technology Stack
The system is built on a modern, robust, and scalable stack:
- **Frontend**: React.js with Vite for lightning-fast performance.
- **Styling**: Vanilla CSS and Tailwind CSS, featuring a premium **Apple-style Glassmorphism** design system.
- **Backend**: Python Flask micro-framework handling data orchestration and AI integration.
- **Database**: SQLite for local data persistence, managed via Pandas for high-speed analysis.
- **AI Engine**: **Ollama (Qwen-1.5B)**, optimized for lightning-fast responses and local privacy.
- **Visualizations**: Chart.js for interactive, high-fidelity data rendering.

---

## 4. System Architecture & Workflow
The project follows a "Human-in-the-Loop" analytics workflow:

1.  **Data Ingestion**: The system reads raw logistics data (CSV) and optimizes it into a structured SQLite database for fast querying.
2.  **Request Layer**: The user interacts with a premium dashboard or the AI Chatbot.
3.  **Intelligence Layer (Backend)**:
    -   The system detects keywords and context (Tamil, English, or Tanglish).
    -   It fetches relevant real-time metrics (Stock levels, turnover ratios, zone efficiency).
    -   It constructs a high-context prompt for the local LLM.
4.  **AI Processing**: Ollama processes the query and generates either a professional text insight or a structured JSON visual.
5.  **Visual Rendering**: The frontend interprets the AI's response, dynamically rendering charts (Bar, Pie, Scatter) or formatted reports.

---

## 5. Key Features & Business Value

### 📊 Advanced Analytics Dashboard
- **Executive Summary**: Real-time tracking of Total Inventory Value, Fulfillment Rates, and Stockout Risks.
- **Zone Health Pulse**: A proprietary live monitor that tracks efficiency across different warehouse zones, identifying bottlenecks before they impact operations.
- **Cost Analysis**: Granular breakdown of holding vs. handling costs.

### 🤖 Professional Enterprise Features
- **Predictive Demand Simulator (New)**: A strategic tool that allows managers to simulate "What-If" scenarios. By adjusting demand forecasts, the system instantly calculates the risk of stockouts across all categories.
- **Enterprise Data Export**: Added one-click "Export to CSV" functionality, allowing teams to download real-time analytics for external reporting and audit trails.
- **Dynamic AI Visualizations**: The AI can now generate real-time charts (Bar, Pie, Line, etc.) directly in the chat window. Users can simply ask "visualize the stock" to get an instant graphical report.
- **Linguistic Flexibility**: Supports English, Tamil, and Tanglish, allowing ground-level staff and managers to communicate in their preferred style.
- **Deep Data Retrieval**: The AI can look up specific Item IDs (SKUs) and provide detailed history and health scores.

### 🍏 Premium User Experience
- **Apple-Level Design**: A clean, "glass" interface that reduces cognitive load and highlights critical data.
- **Full Responsiveness**: Optimized for desktop, tablet, and mobile, enabling "on-the-floor" management.

---

## 6. Managerial Impact
- **Efficiency**: Reduces time-to-insight from hours of manual reporting to seconds of AI conversation.
- **Risk Mitigation**: Automated detection of low-stock and high-turnover anomalies.
- **Localization**: Empowers regional teams through native language support, increasing tool adoption across all levels of the organization.

---

## 🛠 Troubleshooting: LLM Connection
If the AI Bot returns a "Failed to connect to local LLM" error:
1.  **Check Ollama**: Ensure the Ollama application is open and running.
2.  **Model Pull**: Run `ollama pull mistral` in your terminal to ensure the model is downloaded.
3.  **Port Access**: Ensure port `11434` is not blocked by a firewall.
4.  **Restart Backend**: If Ollama was started *after* the backend, restart the backend server (`python app.py`).

---

**VA Bot** represents the future of localized, private, and intelligent warehouse management. Developed by Karuppasamy M.
