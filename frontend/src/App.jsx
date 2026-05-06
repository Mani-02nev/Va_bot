import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, ScatterController, Filler, RadialLinearScale
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart, Bar, Scatter, Doughnut, Line } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Package, AlertTriangle, TrendingUp, DollarSign, Send, Loader2, Bot, User,
  Activity, Star, Map, Box, Clock, Truck, Bell, Search, ArrowUpRight, ArrowDownRight,
  Menu, X
} from 'lucide-react';
import './index.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, ScatterController, Filler, RadialLinearScale,
  MatrixController, MatrixElement
);

const API_BASE = 'http://127.0.0.1:5001/api';

// --- Enterprise Chart Defaults ---
ChartJS.defaults.color = '#6B7280';
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = '#FFFFFF';
ChartJS.defaults.plugins.tooltip.titleColor = '#111827';
ChartJS.defaults.plugins.tooltip.bodyColor = '#6B7280';
ChartJS.defaults.plugins.tooltip.borderColor = '#E5E7EB';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 4;
ChartJS.defaults.plugins.tooltip.displayColors = true;

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chatbot State (Docked)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to **VA Bot**. I am your analytics copilot. How can I assist you with warehouse operations today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard-master`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e, quickReply = null) => {
    if (e) e.preventDefault();
    const userText = quickReply || inputMessage;
    if (!userText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { message: userText });
      setMessages(prev => [...prev, { role: 'bot', text: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: Could not reach VA Bot AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-vdart-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-vdart-accent" />
          <p className="text-vdart-muted font-medium text-sm">Loading Enterprise Analytics...</p>
        </div>
      </div>
    );
  }

  // --- Chart Setup ---
  const vdartBlue = '#0A2A66';
  const vdartAccent = '#1F5EDC';
  const vdartLightBlue = '#DBEAFE';
  
  // Colorful but professional palette
  const chartColors = ['#1F5EDC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { padding: 8 } },
      y: { grid: { color: '#F3F4F6' }, border: { display: false }, ticks: { padding: 8 } }
    },
    plugins: { legend: { display: false } },
    elements: {
      bar: { borderRadius: 2 },
      point: { radius: 0, hoverRadius: 4, backgroundColor: vdartAccent },
      line: { tension: 0.1, borderWidth: 2 }
    }
  };

  // 1. Inventory
  const stockByCatData = {
    labels: data.inventory.stockByCategory.map(d => d.category),
    datasets: [{ data: data.inventory.stockByCategory.map(d => d.stock_level), backgroundColor: chartColors }]
  };
  const stockHistData = {
    labels: data.inventory.histogram.map(d => d.bin),
    datasets: [{ data: data.inventory.histogram.map(d => d.count), backgroundColor: '#8B5CF6' }]
  };
  
  // 2. Demand
  const demandTrendData = { 
    labels: data.demand.variability.map(d => d.category),
    datasets: [{ data: data.demand.variability.map(d => d.demand_std_dev * 10), borderColor: vdartAccent, backgroundColor: 'transparent' }]
  };
  const demandVsForecastData = {
    datasets: [{
      label: 'Demand',
      data: data.demand.vsForecast.map(d => ({ x: d.forecasted_demand_next_7d, y: d.daily_demand })),
      backgroundColor: '#10B981', pointRadius: 3
    }]
  };

  // 3. Risk (Heatmap)
  const riskCategories = [...new Set(data.risk.zoneCatStockout.map(d => d.category))];
  const riskZones = [...new Set(data.risk.zoneCatStockout.map(d => d.zone))];
  const riskHeatmapData = {
    datasets: [{
      data: data.risk.zoneCatStockout.map(d => ({ x: riskZones.indexOf(d.zone), y: riskCategories.indexOf(d.category), v: d.stockout_count_last_month })),
      backgroundColor: (ctx) => {
        const v = ctx.dataset.data[ctx.dataIndex]?.v || 0;
        const max = Math.max(...data.risk.zoneCatStockout.map(d => d.stockout_count_last_month), 1);
        if (v === 0) return '#F9FAFB';
        return `rgba(220, 38, 38, ${Math.max(v / max, 0.1)})`;
      },
      width: ({chart}) => (chart.chartArea || {}).width / riskZones.length - 2,
      height: ({chart}) => (chart.chartArea || {}).height / riskCategories.length - 2,
    }]
  };

  // 4. Supply Chain
  const leadTimeCatData = {
    labels: data.supplyChain.leadTimeCat.map(d => d.category),
    datasets: [{ data: data.supplyChain.leadTimeCat.map(d => d.lead_time_days), backgroundColor: chartColors.slice().reverse() }]
  };
  const leadVsStockData = {
    datasets: [{
      label: 'Lead Time vs Stock',
      data: data.supplyChain.leadVsStock.map(d => ({ x: d.stock_level, y: d.lead_time_days })),
      backgroundColor: '#EF4444', pointRadius: 3
    }]
  };

  // 5. Cost
  const costDonutData = {
    labels: data.cost.breakdown.map(d => d.type),
    datasets: [{ data: data.cost.breakdown.map(d => d.value), backgroundColor: ['#F59E0B', '#8B5CF6'], borderWidth: 1, borderColor: '#FFFFFF', cutout: '70%' }]
  };

  return (
    <div className="flex h-screen bg-vdart-bg text-vdart-text overflow-hidden font-sans">
      
      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-vdart-card border-b border-vdart-border flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Vdart Logo" className="h-10 object-contain" />
              <span className="font-bold text-lg text-vdart-text tracking-tight border-l-2 border-vdart-border pl-4">
                <span className="text-vdart-accent">VA</span> Bot Analytics
              </span>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-vdart-bg border border-vdart-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-vdart-accent transition-colors placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-vdart-success animate-pulse"></div>
              <span className="text-xs font-medium text-vdart-muted">System Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-[1400px] mx-auto space-y-8">

            {/* KPI Cards */}
            <div>
              <h2 className="text-lg font-semibold text-vdart-text mb-4">Executive Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total Value" value={`$${(data.kpis.total_inventory_value / 1000000).toFixed(2)}M`} icon={<DollarSign size={16}/>} />
                <StatCard title="Fulfillment Rate" value={`${data.kpis.avg_fulfillment_rate.toFixed(1)}%`} icon={<TrendingUp size={16}/>} trend="+1.2%" isPositive={true}/>
                <StatCard title="Total Orders" value={data.kpis.total_orders.toLocaleString()} icon={<Package size={16}/>} />
                <StatCard title="Stockout Rate" value={`${data.kpis.stockout_rate.toFixed(2)}%`} icon={<AlertTriangle size={16}/>} trend="-0.5%" isPositive={false}/>
                <StatCard title="Avg Lead Time" value={`${data.kpis.avg_lead_time.toFixed(1)}d`} icon={<Clock size={16}/>} />
                <StatCard title="KPI Score" value={`${data.kpis.overall_kpi.toFixed(1)}`} icon={<Star size={16}/>} trend="+4.1%" isPositive={true}/>
              </div>
            </div>

            {/* Complex Grid Layout (Power BI Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Row 1: Left (Inventory), Right (Demand) */}
              <div className="lg:col-span-1 space-y-6">
                <ChartCard title="Inventory by Category">
                  <Bar data={stockByCatData} options={{...baseChartOptions, indexAxis: 'y'}} />
                </ChartCard>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <ChartCard title="Demand Volatility & Forecasting">
                  <div className="grid grid-cols-2 gap-4 h-[300px]">
                    <div className="flex flex-col h-full">
                      <p className="text-xs text-vdart-muted mb-2 flex-shrink-0">Demand Trend vs Category</p>
                      <div className="relative w-full h-[250px]">
                        <Line data={demandTrendData} options={{...baseChartOptions, plugins: {legend: {display: false}}}} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full">
                      <p className="text-xs text-vdart-muted mb-2 flex-shrink-0">Forecast vs Actual</p>
                      <div className="relative w-full h-[250px]">
                        <Scatter data={demandVsForecastData} options={{...baseChartOptions, scales: { x: { title: { display: true, text: 'Forecast', font: {size: 10} } }, y: { title: { display: true, text: 'Actual', font: {size: 10} } }}}} />
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Row 2: Risk & Cost */}
              <div className="lg:col-span-2 space-y-6">
                <ChartCard title="Stockout Risk Heatmap (Zone vs Category)">
                  <Chart type="matrix" data={riskHeatmapData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { title: () => '', label: (ctx) => `Stockouts: ${ctx.raw.v}` } } },
                    scales: {
                      x: { type: 'category', labels: riskZones, grid: { display: false }, ticks: { font: {size: 10} } },
                      y: { type: 'category', labels: riskCategories, grid: { display: false }, ticks: { font: {size: 10} } }
                    }
                  }} />
                </ChartCard>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <ChartCard title="Cost Breakdown">
                  <div className="flex flex-col h-full items-center justify-center relative">
                    <div className="h-[180px] w-full">
                      <Doughnut data={costDonutData} options={{...baseChartOptions, plugins: {legend: {display: true, position: 'bottom', labels: {usePointStyle: true, boxWidth: 6, font: {size: 11}}}}}} />
                    </div>
                    <div className="absolute top-[40%] text-center pointer-events-none">
                      <span className="text-xs text-vdart-muted block">Total</span>
                      <span className="text-lg font-bold text-vdart-text">${((data.cost.breakdown[0].value + data.cost.breakdown[1].value) / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Row 3: Additional Analytics */}
              <div className="lg:col-span-1 space-y-6">
                <ChartCard title="Stock Level Distribution">
                  <Bar data={stockHistData} options={baseChartOptions} />
                </ChartCard>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <ChartCard title="Lead Time vs Stock Buffer">
                  <div className="h-[250px] relative w-full">
                    <Scatter data={leadVsStockData} options={{...baseChartOptions, scales: { x: { title: { display: true, text: 'Stock Level', font: {size: 10} } }, y: { title: { display: true, text: 'Lead Time (Days)', font: {size: 10} } }}}} />
                  </div>
                </ChartCard>
              </div>

              {/* Row 4: Tables (Supply Chain, Warehouse, Turnover) */}
              <div className="lg:col-span-1">
                <ChartCard title="Lead Time Metrics">
                  <div className="h-[200px]">
                    <Bar data={leadTimeCatData} options={baseChartOptions} />
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-1">
                <TableCard title="Zone Efficiency Analytics">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-vdart-border">
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider">Zone</th>
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider">Efficiency Score</th>
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.warehouse.layoutEff.slice(0, 5).map((z, i) => {
                        const eff = z.avg_efficiency != null && !isNaN(z.avg_efficiency) ? z.avg_efficiency : 0;
                        const effPct = (eff * 100).toFixed(1);
                        const isOptimal = eff > 0.8;
                        return (
                          <tr key={i} className="border-b border-vdart-border/50 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 text-sm font-medium text-vdart-text">Zone {z.zone}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-vdart-text w-12">{effPct}%</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-24">
                                  <div className={`h-full rounded-full ${isOptimal ? 'bg-vdart-success' : 'bg-vdart-warning'}`} style={{ width: `${Math.min(effPct, 100)}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2 py-1 text-[10px] rounded-md font-bold tracking-wide ${isOptimal ? 'bg-vdart-success/10 text-vdart-success border border-vdart-success/20' : 'bg-vdart-warning/10 text-vdart-warning border border-vdart-warning/20'}`}>
                                {isOptimal ? 'OPTIMAL' : 'REVIEW'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableCard>
              </div>

              <div className="lg:col-span-1">
                <TableCard title="Turnover Anomalies">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-vdart-border">
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider">SKU</th>
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider">Turnover Ratio</th>
                        <th className="py-3 px-2 text-xs font-semibold text-vdart-muted uppercase tracking-wider text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.turnover.fast.slice(0, 2).map((item, i) => {
                        const ratio = item.turnover_ratio != null && !isNaN(item.turnover_ratio) ? item.turnover_ratio.toFixed(1) : 'N/A';
                        return (
                          <tr key={i} className="border-b border-vdart-border/50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 text-xs font-mono font-medium text-vdart-text">{item.item_id}</td>
                            <td className="py-3 px-2 text-sm text-vdart-text font-mono font-semibold">{ratio}</td>
                            <td className="py-3 px-2 text-right"><span className="px-2 py-1 text-[10px] rounded-md font-bold tracking-wide bg-vdart-success/10 text-vdart-success border border-vdart-success/20">FAST</span></td>
                          </tr>
                        );
                      })}
                      {data.turnover.slow.slice(0, 2).map((item, i) => {
                        const ratio = item.turnover_ratio != null && !isNaN(item.turnover_ratio) ? item.turnover_ratio.toFixed(1) : 'N/A';
                        return (
                          <tr key={i} className="border-b border-vdart-border/50 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2 text-xs font-mono font-medium text-vdart-text">{item.item_id}</td>
                            <td className="py-3 px-2 text-sm text-vdart-text font-mono font-semibold">{ratio}</td>
                            <td className="py-3 px-2 text-right"><span className="px-2 py-1 text-[10px] rounded-md font-bold tracking-wide bg-vdart-danger/10 text-vdart-danger border border-vdart-danger/20">DEAD</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableCard>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Button & Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isMobileChatOpen && (
          <div className="bg-white rounded-lg w-[350px] h-[550px] flex flex-col mb-4 overflow-hidden enterprise-shadow border border-vdart-border">
            
            {/* Chat Header */}
            <div className="h-14 border-b border-vdart-border flex items-center justify-between px-4 bg-vdart-bg flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-vdart-accent" />
                <h3 className="font-semibold text-sm text-vdart-text">VA Bot Assistant</h3>
              </div>
              <button onClick={() => setIsMobileChatOpen(false)} className="text-vdart-muted hover:text-vdart-text">
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-lg text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                      ? 'bg-vdart text-white rounded-br-none'
                      : 'bg-vdart-bg border border-vdart-border text-vdart-text rounded-bl-none prose prose-sm prose-p:leading-snug prose-a:text-vdart-accent prose-headings:text-sm prose-headings:font-bold prose-headings:text-vdart-text max-w-none'
                    }`}>
                    <ChatMessage msg={msg} />
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex self-start px-4 py-3 bg-vdart-bg border border-vdart-border rounded-lg rounded-bl-none shadow-sm items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-vdart-muted rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-vdart-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-vdart-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts & Input */}
            <div className="p-3 bg-white border-t border-vdart-border flex-shrink-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={(e) => handleSendMessage(e, "Show low stock items")} className="px-2.5 py-1 rounded bg-vdart-bg border border-vdart-border hover:border-vdart-accent text-[11px] text-vdart-muted transition-colors">Low stock items</button>
                <button onClick={(e) => handleSendMessage(e, "Cost breakdown")} className="px-2.5 py-1 rounded bg-vdart-bg border border-vdart-border hover:border-vdart-accent text-[11px] text-vdart-muted transition-colors">Cost breakdown</button>
              </div>
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask VA Bot..."
                  className="w-full bg-vdart-bg border border-vdart-border text-vdart-text text-[13px] rounded-md pl-3 pr-10 py-2 focus:outline-none focus:border-vdart-accent focus:ring-1 focus:ring-vdart-accent transition-all placeholder-gray-400"
                />
                <button type="submit" disabled={chatLoading || !inputMessage.trim()} className="absolute right-2 text-vdart-accent hover:text-vdart-secondary disabled:opacity-50 transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
        
        {!isMobileChatOpen && (
          <button
            onClick={() => setIsMobileChatOpen(true)}
            className="w-14 h-14 bg-vdart rounded-full shadow-lg flex items-center justify-center text-white hover:bg-vdart-secondary transition-colors"
          >
            <Bot size={24} />
          </button>
        )}
      </div>

    </div>
  );
};

// --- Enterprise Components ---

const ChatMessage = ({ msg }) => {
  if (msg.role === 'user') return <>{msg.text}</>;

  // Check if there's a JSON code block in the message
  const parts = msg.text.split(/```json\n([\s\S]*?)\n```/);
  
  if (parts.length === 1) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          try {
            const chartData = JSON.parse(part);
            if (chartData.chart_type) {
              return <ChatChart key={index} config={chartData} />;
            }
          } catch (e) {
            // Not a valid chart JSON, render normally
            return <pre key={index} className="text-xs bg-gray-100 p-2 rounded overflow-x-auto text-gray-800"><code>{part}</code></pre>;
          }
        }
        return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>;
      })}
    </>
  );
};

const ChatChart = ({ config }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: config.chart_type === 'pie' || config.chart_type === 'doughnut', position: 'right', labels: { boxWidth: 10, font: {size: 10} } } },
    scales: config.chart_type === 'pie' || config.chart_type === 'doughnut' ? {} : {
      x: { title: { display: !!config.x_label, text: config.x_label, font: {size: 10} }, ticks: {font: {size: 10}} },
      y: { title: { display: !!config.y_label, text: config.y_label, font: {size: 10} }, ticks: {font: {size: 10}} }
    }
  };

  const chartData = {
    labels: config.labels || [],
    datasets: [{
      label: config.title || 'Data',
      data: config.data,
      backgroundColor: config.colors || ['#1F5EDC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderColor: config.chart_type === 'line' ? '#1F5EDC' : '#FFFFFF',
      borderWidth: config.chart_type === 'line' ? 2 : 1,
      pointRadius: config.chart_type === 'scatter' ? 4 : undefined,
      pointBackgroundColor: config.chart_type === 'scatter' ? '#10B981' : undefined
    }]
  };

  return (
    <div className="my-3 bg-white border border-vdart-border rounded p-2 h-[220px] w-[280px] flex flex-col shadow-sm">
      {config.title && <h4 className="text-[11px] font-bold text-center mb-1 text-vdart-text">{config.title}</h4>}
      <div className="flex-1 relative w-full">
        {config.chart_type === 'bar' && <Bar data={chartData} options={chartOptions} />}
        {config.chart_type === 'line' && <Line data={chartData} options={chartOptions} />}
        {config.chart_type === 'scatter' && <Scatter data={chartData} options={chartOptions} />}
        {config.chart_type === 'pie' && <Pie data={chartData} options={chartOptions} />}
        {config.chart_type === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isPositive }) => (
  <div className="bg-vdart-card p-4 rounded-sm border border-vdart-border enterprise-shadow flex flex-col justify-between">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-[11px] font-semibold text-vdart-muted uppercase tracking-wider">{title}</h3>
      <div className="text-gray-400">{icon}</div>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-xl font-bold text-vdart-text">{value}</div>
      {trend && (
        <div className={`text-[11px] font-bold ${isPositive === true ? 'text-vdart-success' : isPositive === false ? 'text-vdart-danger' : 'text-vdart-warning'}`}>
          {trend}
        </div>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, className = "", children }) => (
  <div className={`bg-vdart-card p-5 rounded-sm border border-vdart-border enterprise-shadow flex flex-col ${className} min-h-[280px]`}>
    <h3 className="font-semibold text-sm text-vdart-text mb-4 border-b border-vdart-border pb-2">{title}</h3>
    <div className="flex-1 relative w-full h-full">{children}</div>
  </div>
);

const TableCard = ({ title, children }) => (
  <div className="bg-vdart-card rounded-sm border border-vdart-border enterprise-shadow flex flex-col min-h-[280px]">
    <div className="p-4 border-b border-vdart-border">
      <h3 className="font-semibold text-sm text-vdart-text">{title}</h3>
    </div>
    <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

export default App;
