import sqlite3
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# --- Configuration ---
DATA_FILE = '../data/logistics_dataset.csv'
DB_FILE = 'warehouse.db'
OLLAMA_URL = 'http://localhost:11434/api/generate'
OLLAMA_MODEL = 'mistral:latest' # Change this if you have a different model (e.g., mistral, llama2)

# --- Data Ingestion & Database Setup ---
def setup_database():
    """Reads the CSV and populates the SQLite database."""
    print(f"Setting up database from {DATA_FILE}...")
    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file {DATA_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    df = pd.read_csv(DATA_FILE)
    
    # Optional: Basic clean up or derived columns
    # We load everything into a table called 'inventory'
    df.to_sql('inventory', conn, if_exists='replace', index=False)
    conn.close()
    print("Database setup complete.")

# --- Helper: Query DB ---
def execute_query(query, params=()):
    """Executes a SQL query and returns results as a list of dicts."""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row  # Return dicts instead of tuples
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Database error: {e}")
        return []

# --- API Endpoints: Dashboard Analytics ---
@app.route('/api/kpis', methods=['GET'])
def get_kpis():
    """Returns key performance indicators for the dashboard."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Total items
        cursor.execute("SELECT COUNT(*) FROM inventory")
        total_items = cursor.fetchone()[0]

        # Total stock
        cursor.execute("SELECT SUM(stock_level) FROM inventory")
        total_stock = cursor.fetchone()[0]

        # Items below reorder point (low stock)
        cursor.execute("SELECT COUNT(*) FROM inventory WHERE stock_level <= reorder_point")
        low_stock_items = cursor.fetchone()[0]

        # Average fulfillment rate
        cursor.execute("SELECT AVG(order_fulfillment_rate) FROM inventory")
        avg_fulfillment = round(cursor.fetchone()[0] * 100, 2) # As percentage

        # Total Stockouts Last Month
        cursor.execute("SELECT SUM(stockout_count_last_month) FROM inventory")
        total_stockouts = cursor.fetchone()[0]

        return jsonify({
            "total_items": total_items,
            "total_stock": total_stock,
            "low_stock_items": low_stock_items,
            "avg_fulfillment_rate": avg_fulfillment,
            "total_stockouts": total_stockouts
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/inventory-by-category', methods=['GET'])
def inventory_by_category():
    data = execute_query("""
        SELECT category, SUM(stock_level) as total_stock 
        FROM inventory 
        GROUP BY category 
        ORDER BY total_stock DESC
    """)
    return jsonify(data)

@app.route('/api/low-stock', methods=['GET'])
def low_stock_items():
    data = execute_query("""
        SELECT item_id, category, stock_level, reorder_point, daily_demand
        FROM inventory 
        WHERE stock_level <= reorder_point 
        ORDER BY (reorder_point - stock_level) DESC
        LIMIT 10
    """)
    return jsonify(data)

@app.route('/api/turnover-efficiency', methods=['GET'])
def turnover_efficiency():
    data = execute_query("""
        SELECT category, AVG(turnover_ratio) as avg_turnover, AVG(layout_efficiency_score) as avg_efficiency
        FROM inventory
        GROUP BY category
    """)
    return jsonify(data)

@app.route('/api/eda/scatter', methods=['GET'])
def eda_scatter():
    # Stock level vs daily demand for scatter plot
    data = execute_query("""
        SELECT item_id, category, stock_level, daily_demand
        FROM inventory 
        ORDER BY RANDOM()
        LIMIT 200
    """)
    return jsonify(data)

@app.route('/api/eda/zones', methods=['GET'])
def eda_zones():
    data = execute_query("""
        SELECT zone, COUNT(*) as count 
        FROM inventory 
        GROUP BY zone
    """)
    return jsonify(data)

@app.route('/api/eda/fulfillment', methods=['GET'])
def eda_fulfillment():
    # fulfillment rate vs handling cost
    data = execute_query("""
        SELECT category, AVG(order_fulfillment_rate) as avg_fulfillment, AVG(handling_cost_per_unit) as avg_handling_cost
        FROM inventory 
        GROUP BY category
    """)
    return jsonify(data)

@app.route('/api/eda/popularity', methods=['GET'])
def eda_popularity():
    data = execute_query("""
        SELECT item_id, item_popularity_score 
        FROM inventory 
        ORDER BY item_popularity_score DESC
        LIMIT 10
    """)
    return jsonify(data)

@app.route('/api/eda/efficiency', methods=['GET'])
def eda_efficiency():
    data = execute_query("""
        SELECT zone, AVG(layout_efficiency_score) as avg_efficiency
        FROM inventory 
        GROUP BY zone
    """)
    return jsonify(data)

@app.route('/api/eda/heatmap', methods=['GET'])
def eda_heatmap():
    # Heatmap of Category vs Zone by Total Stock
    data = execute_query("""
        SELECT category, zone, SUM(stock_level) as total_stock
        FROM inventory 
        GROUP BY category, zone
    """)
    return jsonify(data)

@app.route('/api/dashboard-master', methods=['GET'])
def dashboard_master():
    try:
        conn = sqlite3.connect(DB_FILE)
        df = pd.read_sql_query("SELECT * FROM inventory", conn)
        conn.close()

        # 1. Executive KPIs
        kpis = {
            "total_inventory_value": float((df['stock_level'] * df['unit_price']).sum()),
            "avg_fulfillment_rate": float(df['order_fulfillment_rate'].mean() * 100),
            "total_orders": int(df['total_orders_last_month'].sum()),
            "stockout_rate": float((df['stockout_count_last_month'].sum() / df['total_orders_last_month'].sum()) * 100) if df['total_orders_last_month'].sum() > 0 else 0,
            "avg_lead_time": float(df['lead_time_days'].mean()),
            "overall_kpi": float(df['KPI_score'].mean() * 100)
        }

        # 2. Inventory Analytics
        cat_group = df.groupby('category')
        stock_by_category = cat_group['stock_level'].sum().reset_index().to_dict('records')
        stock_vs_reorder = cat_group[['stock_level', 'reorder_point']].sum().reset_index().to_dict('records')
        # Histogram data (bins)
        stock_hist = pd.cut(df['stock_level'], bins=10).value_counts().sort_index().reset_index()
        stock_hist.columns = ['bin', 'count']
        stock_hist['bin'] = stock_hist['bin'].astype(str)
        
        # 3. Demand Analytics
        demand_vs_forecast = df[['item_id', 'daily_demand', 'forecasted_demand_next_7d']].sample(min(200, len(df))).to_dict('records')
        demand_variability = cat_group['demand_std_dev'].mean().reset_index().to_dict('records')
        
        # 4. Stockout & Risk
        zone_cat_stockout = df.groupby(['zone', 'category'])['stockout_count_last_month'].sum().reset_index().to_dict('records')
        top_stockouts = df.nlargest(10, 'stockout_count_last_month')[['item_id', 'stockout_count_last_month']].to_dict('records')
        items_below_reorder = len(df[df['stock_level'] < df['reorder_point']])
        
        # 5. Supply Chain
        lead_time_cat = cat_group['lead_time_days'].mean().reset_index().to_dict('records')
        lead_vs_stock = df[['lead_time_days', 'stock_level']].sample(min(200, len(df))).to_dict('records')
        
        # 6. Warehouse Ops
        zone_group = df.groupby('zone')
        picking_by_zone = zone_group['picking_time_seconds'].mean().reset_index().to_dict('records')
        layout_eff = zone_group['layout_efficiency_score'].mean().reset_index().to_dict('records')
        pick_vs_orders = df[['picking_time_seconds', 'total_orders_last_month']].sample(min(200, len(df))).to_dict('records')
        
        # 7. Cost Analytics
        total_holding = (df['holding_cost_per_unit_day'] * df['stock_level']).sum()
        total_handling = (df['handling_cost_per_unit'] * df['total_orders_last_month']).sum()
        cost_breakdown = [{"type": "Holding Cost", "value": float(total_holding)}, {"type": "Handling Cost", "value": float(total_handling)}]
        cost_by_cat = cat_group['handling_cost_per_unit'].mean().reset_index().to_dict('records')
        
        # 8. Turnover Analytics
        turnover_cat = cat_group['turnover_ratio'].mean().reset_index().to_dict('records')
        turnover_vs_demand = df[['turnover_ratio', 'daily_demand']].sample(min(200, len(df))).to_dict('records')
        fast_moving = df.nlargest(5, 'turnover_ratio')[['item_id', 'category', 'turnover_ratio']].to_dict('records')
        slow_moving = df.nsmallest(5, 'turnover_ratio')[['item_id', 'category', 'turnover_ratio']].to_dict('records')

        return jsonify({
            "kpis": kpis,
            "inventory": {"stockByCategory": stock_by_category, "stockVsReorder": stock_vs_reorder, "histogram": stock_hist.to_dict('records')},
            "demand": {"vsForecast": demand_vs_forecast, "variability": demand_variability},
            "risk": {"zoneCatStockout": zone_cat_stockout, "topStockouts": top_stockouts, "belowReorder": items_below_reorder},
            "supplyChain": {"leadTimeCat": lead_time_cat, "leadVsStock": lead_vs_stock},
            "warehouse": {"pickingByZone": picking_by_zone, "layoutEff": layout_eff, "pickVsOrders": pick_vs_orders},
            "cost": {"breakdown": cost_breakdown, "byCat": cost_by_cat},
            "turnover": {"byCat": turnover_cat, "vsDemand": turnover_vs_demand, "fast": fast_moving, "slow": slow_moving}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Chatbot Integration (Ollama) ---

# Master Prompt Definition
SYSTEM_PROMPT = """You are a senior data engineer, warehouse analytics AI assistant, and UI/UX expert for the VA Bot Dashboard.
Your goal is to answer user questions regarding warehouse operations, inventory, and logistics based on the provided data context.

RULES:
1. Be highly professional, extremely concise, and insightful. 
2. Use the provided context data to answer the question. If the data doesn't contain the answer, politely state you cannot determine this from the available data.
3. NEVER hallucinate numbers or facts.
4. Formatting: Structure your response perfectly using Markdown. Use bolding and bullet points. DO NOT use numbered lists (like 1., 2., 3.) for your main headings.
5. If the user asks you to "create a visual" or "suggest a visual" (e.g., a heatmap, pie chart, or a scatter plot):
   - DO NOT EVER SAY "I cannot create visuals directly", "I am a text-based AI", or anything similar. Just create the chart!
   - You MUST output a code block starting with ```json and ending with ``` containing the chart data.
   - CRITICAL: You MUST map REAL VALUES from the CONTEXT DATA into the JSON arrays. DO NOT use placeholders.
   - CRITICAL: The JSON MUST be strictly valid. DO NOT put any `//` comments inside the JSON block.
   - Use this exact structure:
     {{
       "chart_type": "bar",
       "title": "Your Chart Title",
       "x_label": "X Axis Label",
       "y_label": "Y Axis Label",
       "labels": ["Category A", "Category B", "Category C"],
       "data": [10, 20, 30]
     }}
   - Note: For "scatter" charts, "data" MUST be an array of objects like this: [{{"x": 10, "y": 20}}, {{"x": 30, "y": 40}}]
   - Underneath the JSON code block, provide a brief, insightful explanation of the visual you just created.
6. Think step-by-step before providing the final answer, but ONLY output the final structured, polished response to the user.

CONTEXT DATA FROM DATABASE:
{context}

USER QUESTION:
{question}
"""

def get_context_for_question(question):
    """
    Very basic heuristic to fetch relevant data. 
    In a real RAG system, we would use embeddings or an LLM to generate the SQL.
    Here we do some keyword matching to pull summary data.
    """
    q_lower = question.lower()
    context_data = {}

    if 'stockout' in q_lower or 'shortage' in q_lower:
        context_data['stockouts'] = execute_query("SELECT item_id, category, stockout_count_last_month FROM inventory WHERE stockout_count_last_month > 0 ORDER BY stockout_count_last_month DESC LIMIT 5")
    if 'low stock' in q_lower or 'reorder' in q_lower:
         context_data['low_stock'] = execute_query("SELECT item_id, category, stock_level, reorder_point FROM inventory WHERE stock_level <= reorder_point LIMIT 5")
    if 'category' in q_lower or 'categories' in q_lower:
         context_data['categories'] = execute_query("SELECT category, COUNT(item_id) as num_items, SUM(stock_level) as total_stock FROM inventory GROUP BY category")
    if 'fulfillment' in q_lower or 'rate' in q_lower:
         context_data['fulfillment'] = execute_query("SELECT category, AVG(order_fulfillment_rate) as avg_rate FROM inventory GROUP BY category")
    
    # If no specific keywords, grab general KPIs
    if not context_data:
        context_data['kpis'] = execute_query("SELECT COUNT(*) as total_items, SUM(stock_level) as total_stock, SUM(stockout_count_last_month) as total_stockouts FROM inventory")

    return json.dumps(context_data)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # 1. Get relevant data from DB based on question
    context = get_context_for_question(user_message)

    # 2. Construct prompt
    prompt = SYSTEM_PROMPT.format(context=context, question=user_message)

    # 3. Call local Ollama API
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120 # Prevent hanging forever
        )
        response.raise_for_status()
        result = response.json()
        return jsonify({"response": result.get("response", "No response from model.")})

    except requests.exceptions.RequestException as e:
        print(f"Ollama API error: {e}")
        return jsonify({
            "error": "Failed to connect to local LLM. Make sure Ollama is running.",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    setup_database()
    app.run(debug=True, port=5001)
