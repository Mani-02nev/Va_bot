import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, ScatterController, Filler, RadialLinearScale,
  RadarController, BubbleController
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart, Bar, Scatter, Doughnut, Line } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Package, AlertTriangle, TrendingUp, DollarSign, Send, Loader2, Bot, User,
  Activity, Star, Map, Box, Clock, Truck, Bell, Search, ArrowUpRight, ArrowDownRight,
  Menu, X, Target, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight
} from 'lucide-react';
import './index.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, ScatterController, Filler, RadialLinearScale,
  RadarController, BubbleController,
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

  // Custom Handcrafted Vector Arrows
  const HanddrawnLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180">
      <path d="M4 12C4 12 8 8 12 8C16 8 20 12 20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4L4 12L8 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const HanddrawnRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12C4 12 8 8 12 8C16 8 20 12 20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4L20 12L16 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Chatbot State (Docked)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to **VA Bot**. I am your analytics copilot. How can I assist you with warehouse operations today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const kpiScrollRef = useRef(null);

  const scrollKpis = (direction) => {
    if (kpiScrollRef.current) {
      const scrollAmount = 300;
      kpiScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
      const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Could not reach VA Bot AI. Make sure the backend and Ollama are running.';
      setMessages(prev => [...prev, { role: 'bot', text: `Error: ${errorMsg}` }]);
      console.error('Chat Error:', error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center mesh-gradient">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-vdart-accent/20 animate-pulse rounded-full"></div>
            <Loader2 className="animate-spin h-10 w-10 text-vdart-accent relative z-10" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-vdart-text font-bold text-lg tracking-tight">VA Bot</p>
            <p className="text-vdart-muted font-medium text-xs uppercase tracking-widest">Intelligence Engine Loading</p>
          </div>
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
      width: ({ chart }) => (chart.chartArea || {}).width / riskZones.length - 2,
      height: ({ chart }) => (chart.chartArea || {}).height / riskCategories.length - 2,
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
    labels: (data.cost?.breakdown || []).map(d => d.type),
    datasets: [{
      data: (data.cost?.breakdown || []).map(d => d.value),
      backgroundColor: ['#0EA5E9', '#8B5CF6'],
      hoverBackgroundColor: ['#0284C7', '#7C3AED'],
      borderWidth: 0,
      cutout: '75%',
      borderRadius: 4
    }]
  };

  // 6. Power BI Visual: Demand Forecasting Trend
  const forecastData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Actual Demand',
        data: [12000, 19000, 15000, 22000, 18000, 24000, 21000],
        borderColor: '#0EA5E9',
        backgroundColor: '#0EA5E9',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Projected Forecast',
        data: [12000, 19000, 15000, 22000, 20000, 26000, 28000],
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF620',
        borderDash: [5, 5],
        tension: 0.4,
        fill: true
      }
    ]
  };

  // 7. Power BI Visual: Zone Utilization Heatmap
  const matrixData = {
    datasets: [{
      label: 'Utilization Matrix',
      data: data.warehouse.layoutEff.map(z => ({
        x: `Zone ${z.zone}`,
        y: 'Util %',
        v: parseFloat(((z.layout_efficiency_score || 0) * 100).toFixed(0))
      })).concat(data.warehouse.layoutEff.map(z => ({
        x: `Zone ${z.zone}`,
        y: 'Risk',
        v: parseFloat(((z.stockout_rate || 0) * 100).toFixed(0))
      }))),
      backgroundColor: (c) => {
        const item = c.dataset.data[c.dataIndex];
        if (!item) return 'transparent';
        const alpha = Math.max(0.1, item.v / 100);
        return item.y === 'Util %' ? `rgba(14, 165, 233, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
      },
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.5)',
      width: ({ chart }) => chart.chartArea ? (chart.chartArea.width / data.warehouse.layoutEff.length) - 8 : 30,
      height: ({ chart }) => chart.chartArea ? (chart.chartArea.height / 2) - 8 : 30
    }]
  };

  // 8. Power BI Visual: Radar - Multi-Zone Performance
  const radarData = {
    labels: ['Fulfillment', 'Efficiency', 'Stock Level', 'Turnover', 'Risk Control'],
    datasets: (data.warehouse?.layoutEff || []).slice(0, 3).map((z, i) => ({
      label: `Zone ${z.zone}`,
      data: [
        (z.order_fulfillment_rate || 0) * 100,
        (z.layout_efficiency_score || 0) * 100,
        ((z.stock_level || 0) / 500) * 100,
        ((z.turnover_ratio || 0) / 5) * 100,
        100 - ((z.stockout_rate || 0) * 100)
      ],
      backgroundColor: i === 0 ? 'rgba(14, 165, 233, 0.2)' : i === 1 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
      borderColor: i === 0 ? '#0EA5E9' : i === 1 ? '#8B5CF6' : '#F59E0B',
      borderWidth: 2,
      pointBackgroundColor: i === 0 ? '#0EA5E9' : i === 1 ? '#8B5CF6' : '#F59E0B',
    }))
  };

  // 9. Power BI Visual: Bubble Chart - Inventory Risk
  const bubbleData = {
    datasets: [{
      label: 'Inventory SKUs',
      data: (data.turnover?.fast || []).slice(0, 10).map(item => ({
        x: item.stock_level || 0,
        y: item.lead_time_days || 0,
        r: Math.max(5, (item.stockout_count_last_month || 0) / 2)
      })).concat((data.turnover?.slow || []).slice(0, 10).map(item => ({
        x: item.stock_level || 0,
        y: item.lead_time_days || 0,
        r: Math.max(5, (item.stockout_count_last_month || 0) / 2)
      }))),
      backgroundColor: 'rgba(14, 165, 233, 0.5)',
      borderColor: '#0EA5E9',
      borderWidth: 1,
    }]
  };

  // 11. Power BI Visual: Operational Throughput Pulse
  const throughputData = {
    labels: (data.operational?.throughput || []).map(d => `Zone ${d.zone}`),
    datasets: [{
      label: 'Order Volume',
      data: (data.operational?.throughput || []).map(d => d.orders),
      backgroundColor: [
        'rgba(14, 165, 233, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderRadius: 4,
    }]
  };
  const polarData = {
    labels: (data.fulfillment || []).map(d => d.category),
    datasets: [{
      label: 'Fulfillment Rate',
      data: (data.fulfillment || []).map(d => (d.avg_rate || 0) * 100),
      backgroundColor: [
        'rgba(14, 165, 233, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(239, 68, 68, 0.6)',
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="flex h-screen bg-vdart-bg text-vdart-text overflow-hidden font-sans">

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 glass-nav flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Vdart Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
              <div className="flex flex-col -gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl text-vdart-accent tracking-tighter uppercase italic">Warehouse</span>
                  <span className="font-bold text-2xl text-vdart-text tracking-tighter uppercase">Analytics</span>
                </div>
                <div className="flex items-center gap-2 -mt-1.5">
                  <span className="text-[10px] font-bold text-vdart-muted tracking-[0.3em] uppercase">Enterprise Control Center</span>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-vdart-accent/40 to-transparent"></div>
                </div>
              </div>
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

            {/* Future Visual: Zone Health Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.warehouse.layoutEff.slice(0, 4).map((zone, idx) => (
                <div key={idx} className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-vdart-accent">
                  <div className="w-10 h-10 rounded-full bg-vdart-accent/10 flex items-center justify-center flex-shrink-0">
                    <Activity size={20} className="text-vdart-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-vdart-muted uppercase tracking-wider">Zone {zone.zone} Health</p>
                    <p className="text-lg font-bold text-vdart-text">{((zone.layout_efficiency_score || 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-2 h-2 rounded-full ${(zone.layout_efficiency_score || 0) > 0.8 ? 'bg-vdart-success' : 'bg-vdart-warning'} animate-pulse`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* KPI Section with Side Swipe */}
            <div className="relative group/kpi">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-vdart-text tracking-tight flex items-center gap-2">
                  Executive Summary
                  <span className="px-2 py-0.5 bg-vdart-accent/10 text-vdart-accent text-[10px] rounded-full uppercase tracking-widest font-black">Live Pulse</span>
                </h2>
                <div className="flex gap-2 text-[10px] text-vdart-muted uppercase font-bold tracking-widest">
                  Swipe for more <ArrowUpRight size={12} className="rotate-90" />
                </div>
              </div>

              {/* MNC Level Navigation Arrows */}
              <button
                onClick={() => scrollKpis('left')}
                className="absolute left-[-40px] top-[50%] -translate-y-1/2 z-20 p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-vdart-accent shadow-lg opacity-0 group-hover/kpi:opacity-100 transition-all hover:bg-vdart-accent hover:text-white hover:shadow-vdart-accent/20 hidden xl:flex items-center justify-center"
                aria-label="Previous"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scrollKpis('right')}
                className="absolute right-[-40px] top-[50%] -translate-y-1/2 z-20 p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-vdart-accent shadow-lg opacity-0 group-hover/kpi:opacity-100 transition-all hover:bg-vdart-accent hover:text-white hover:shadow-vdart-accent/20 hidden xl:flex items-center justify-center"
                aria-label="Next"
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>

              <div
                ref={kpiScrollRef}
                className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 scroll-smooth"
              >
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Total Value" value={`$${(data.kpis?.total_inventory_value / 1000000).toFixed(2)}M`} icon={<DollarSign size={16} />} sparklineData={[30, 45, 35, 50, 40, 60]} isPositive={true} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Fulfillment" value={`${(data.kpis?.avg_fulfillment_rate || 0).toFixed(1)}%`} icon={<TrendingUp size={16} />} trend="+1.2%" isPositive={true} sparklineData={[85, 88, 86, 89, 90, 92]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Total Orders" value={(data.kpis?.total_orders || 0).toLocaleString()} icon={<Package size={16} />} sparklineData={[200, 250, 230, 280, 260, 310]} isPositive={true} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Stockout Rate" value={`${(data.kpis?.stockout_rate || 0).toFixed(2)}%`} icon={<AlertTriangle size={16} />} trend="-0.5%" isPositive={false} sparklineData={[5, 4.5, 4.8, 4.2, 4.0, 3.8]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Avg Lead Time" value={`${(data.kpis?.avg_lead_time || 0).toFixed(1)}d`} icon={<Clock size={16} />} trend="-0.2d" isPositive={true} sparklineData={[8.5, 8.2, 8.4, 8.1, 7.9, 7.8]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="KPI Score" value={`${(data.kpis?.overall_kpi || 0).toFixed(1)}`} icon={<Star size={16} />} trend="+4.1%" isPositive={true} sparklineData={[75, 78, 77, 80, 82, 85]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Picking Time" value={`${(data.warehouse?.pickingByZone?.[0]?.picking_time_seconds || 120).toFixed(0)}s`} icon={<Activity size={16} />} trend="-5s" isPositive={true} sparklineData={[130, 125, 128, 122, 120, 118]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Active Zones" value={(data.warehouse?.layoutEff?.length || 0).toString()} icon={<Map size={16} />} isPositive={true} sparklineData={[5, 5, 5, 5, 5, 5]} />
                </div>
                <div className="flex-shrink-0 w-[calc(20%-12px)] min-w-[220px]">
                  <StatCard title="Turnover" value={`${(data.turnover?.byCat?.[0]?.turnover_ratio || 0).toFixed(1)}x`} icon={<Box size={16} />} trend="+0.3" isPositive={true} sparklineData={[3.2, 3.4, 3.3, 3.5, 3.6, 3.8]} />
                </div>
              </div>
            </div>

            {/* Complex Grid Layout (Power BI Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Row 1: Left (Inventory), Right (Demand) */}
              <div className="lg:col-span-1 space-y-6">
                <ChartCard title="Inventory by Category">
                  <Bar data={stockByCatData} options={{ ...baseChartOptions, indexAxis: 'y' }} />
                </ChartCard>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <ChartCard title="Demand Volatility & Forecasting">
                  <div className="grid grid-cols-2 gap-4 h-[300px]">
                    <div className="flex flex-col h-full">
                      <p className="text-xs text-vdart-muted mb-2 flex-shrink-0">Demand Trend vs Category</p>
                      <div className="relative w-full h-[250px]">
                        <Line data={demandTrendData} options={{ ...baseChartOptions, plugins: { legend: { display: false } } }} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full">
                      <p className="text-xs text-vdart-muted mb-2 flex-shrink-0">Forecast vs Actual</p>
                      <div className="relative w-full h-[250px]">
                        <Scatter data={demandVsForecastData} options={{ ...baseChartOptions, scales: { x: { title: { display: true, text: 'Forecast', font: { size: 10 } } }, y: { title: { display: true, text: 'Actual', font: { size: 10 } } } } }} />
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Row 2: Risk & Cost */}
              <div className="lg:col-span-2 flex">
                <ChartCard title="Stockout Risk Heatmap (Zone vs Category)" className="flex-1">
                  <div className="h-[250px] w-full">
                    <Chart type="matrix" data={riskHeatmapData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { callbacks: { title: () => '', label: (ctx) => `Stockouts: ${ctx.raw.v}` } } },
                      scales: {
                        x: { type: 'category', labels: riskZones, grid: { display: false }, ticks: { font: { size: 10 } } },
                        y: { type: 'category', labels: riskCategories, grid: { display: false }, ticks: { font: { size: 10 } } }
                      }
                    }} />
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-1 flex">
                <ChartCard title="Cost Analysis (Holding vs Handling)" className="flex-1">
                  <div className="flex flex-col h-full items-center justify-center relative py-4">
                    <div className="h-[220px] w-full">
                      <Doughnut data={costDonutData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { x: { display: false }, y: { display: false } },
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: { usePointStyle: true, boxWidth: 10, font: { size: 10, weight: '600' }, padding: 15, color: '#64748B' }
                          }
                        }
                      }} />
                    </div>
                    <div className="absolute top-[35%] text-center pointer-events-none flex flex-col items-center">
                      <span className="text-[10px] font-bold text-vdart-muted uppercase tracking-[0.2em] mb-1">Total Cost</span>
                      <span className="text-2xl font-[900] text-vdart-text leading-none tracking-tight">
                        ${(((data.cost?.breakdown?.[0]?.value || 0) + (data.cost?.breakdown?.[1]?.value || 0)) / 1000).toFixed(1)}k
                      </span>
                      <div className="w-8 h-1 bg-vdart-accent/20 rounded-full mt-2"></div>
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
                    <Scatter data={leadVsStockData} options={{ ...baseChartOptions, scales: { x: { title: { display: true, text: 'Stock Level', font: { size: 10 } } }, y: { title: { display: true, text: 'Lead Time (Days)', font: { size: 10 } } } } }} />
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
                        const eff = z.layout_efficiency_score != null && !isNaN(z.layout_efficiency_score) ? z.layout_efficiency_score : 0;
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

              {/* Row 5: Power BI Advanced Visuals */}
              <div className="lg:col-span-2">
                <ChartCard title="Demand Volatility & Forecasting (AI Driven)">
                  <div className="h-[280px] w-full">
                    <Line data={forecastData} options={{
                      ...baseChartOptions,
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
                        x: { grid: { display: false } }
                      },
                      plugins: {
                        legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } } }
                      }
                    }} />
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-1">
                <ChartCard title="Zone Utilization Matrix">
                  <div className="h-[280px] w-full">
                    <Chart type="matrix" data={matrixData} options={{
                      ...baseChartOptions,
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (c) => `${c.raw.y} for ${c.raw.x}: ${c.raw.v}%` } }
                      },
                      scales: {
                        x: { type: 'category', labels: data.warehouse.layoutEff.map(z => `Zone ${z.zone}`), grid: { display: false } },
                        y: { type: 'category', labels: ['Util %', 'Risk'], grid: { display: false } }
                      }
                    }} />
                  </div>
                </ChartCard>
              </div>
              {/* Row 6: Advanced Intelligence Visuals */}
              <div className="lg:col-span-1 flex">
                <ChartCard title="Zone Intelligence Radar" className="flex-1">
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <Chart type="radar" data={radarData} options={{
                      ...baseChartOptions,
                      scales: {
                        r: {
                          angleLines: { display: true, color: '#E5E7EB' },
                          grid: { color: '#E5E7EB' },
                          suggestedMin: 0,
                          suggestedMax: 100,
                          ticks: { display: false }
                        }
                      },
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, font: { size: 10 } } } }
                    }} />
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-1 flex">
                <ChartCard title="Category Fulfillment (Polar Analysis)" className="flex-1">
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <Chart type="polarArea" data={polarData} options={{
                      ...baseChartOptions,
                      scales: { r: { grid: { color: '#E5E7EB' }, ticks: { display: false } } },
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, font: { size: 9 } } } }
                    }} />
                  </div>
                </ChartCard>
              </div>

              <div className="lg:col-span-1 flex">
                <ChartCard title="Inventory Risk Profile (Bubble Analysis)" className="flex-1">
                  <div className="h-[300px] w-full">
                    <Chart type="bubble" data={bubbleData} options={{
                      ...baseChartOptions,
                      scales: {
                        x: { title: { display: true, text: 'Stock Level', font: { size: 10 } } },
                        y: { title: { display: true, text: 'Lead Time (Days)', font: { size: 10 } } }
                      },
                      plugins: {
                        tooltip: { callbacks: { label: (c) => `Stock: ${c.raw.x}, Lead Time: ${c.raw.y}, Risk: ${c.raw.r}` } }
                      }
                    }} />
                  </div>
                </ChartCard>
              </div>

              {/* Row 7: Operational Throughput Pulse */}
              <div className="lg:col-span-3 flex">
                <ChartCard title="Operational Throughput Pulse (Orders by Zone)" className="flex-1">
                  <div className="h-[250px] w-full">
                    <Bar data={throughputData} options={{
                      ...baseChartOptions,
                      scales: { y: { beginAtZero: true, grid: { color: '#F3F4F6' } } }
                    }} />
                  </div>
                </ChartCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Button & Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isMobileChatOpen && (
          <div className="glass-card fixed inset-0 md:relative md:inset-auto w-full h-full md:w-[380px] md:h-[600px] flex flex-col mb-0 md:mb-4 overflow-hidden border-0 md:border md:border-white/40 shadow-2xl z-[60]">

            {/* Chat Header */}
            <div className="h-16 border-b border-white/20 flex items-center justify-between px-5 bg-white/30 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center shadow-md border border-white/50 overflow-hidden group">
                  <img src="/bot_icon.png" alt="VA Bot" className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-vdart-text tracking-tight">VA Bot Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-vdart-success animate-pulse"></span>
                    <p className="text-[10px] text-vdart-success font-bold tracking-widest uppercase">Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsMobileChatOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-vdart-muted hover:text-vdart-text transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar bg-white/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm border ${msg.role === 'user'
                    ? 'bg-vdart-accent/10 border-vdart-accent/20'
                    : 'bg-white border-white/40 overflow-hidden'
                    }`}>
                    {msg.role === 'user'
                      ? <User size={16} className="text-vdart-accent" />
                      : <img src="/logo.png" alt="Bot" className="w-6 h-6 object-contain" />
                    }
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                      ? 'bg-vdart-accent text-white rounded-tr-none shadow-md'
                      : 'bg-white/60 backdrop-blur-md border border-white/40 text-vdart-text rounded-tl-none shadow-sm prose prose-sm prose-p:leading-snug prose-a:text-vdart-accent prose-headings:text-sm prose-headings:font-bold prose-headings:text-vdart-text max-w-none'
                      }`}>
                      <ChatMessage msg={msg} />
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex self-start px-4 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl rounded-bl-none shadow-sm items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-vdart-accent/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-vdart-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-vdart-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts & Input */}
            <div className="p-4 bg-white/40 backdrop-blur-xl border-t border-white/20 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask VA Bot ..."
                  className="w-full bg-white/80 backdrop-blur-md border border-white/80 text-vdart-text text-[13px] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-vdart-accent/20 transition-all placeholder-gray-400 shadow-inner"
                />
                <button type="submit" disabled={chatLoading || !inputMessage.trim()} className="absolute right-2 w-8 h-8 rounded-lg bg-vdart-accent text-white flex items-center justify-center hover:bg-vdart-secondary disabled:opacity-50 transition-all shadow-md">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {!isMobileChatOpen && (
          <button
            onClick={() => setIsMobileChatOpen(true)}
            className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-vdart-accent/10 backdrop-blur-md overflow-hidden p-2.5"
          >
            <img src="/logo.png" alt="VA Bot" className="w-full h-full object-contain" />
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
    plugins: { legend: { display: config.chart_type === 'pie' || config.chart_type === 'doughnut', position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } },
    scales: config.chart_type === 'pie' || config.chart_type === 'doughnut' ? {} : {
      x: { title: { display: !!config.x_label, text: config.x_label, font: { size: 10 } }, ticks: { font: { size: 10 } } },
      y: { title: { display: !!config.y_label, text: config.y_label, font: { size: 10 } }, ticks: { font: { size: 10 } } }
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

const StatCard = ({ title, value, icon, trend, isPositive, sparklineData }) => (
  <div className="glass-card p-4 flex flex-col gap-2 hover:translate-y-[-2px] transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-lg bg-vdart-accent/10 flex items-center justify-center text-vdart-accent group-hover:bg-vdart-accent group-hover:text-white transition-colors">
        {icon}
      </div>
      {trend && (
        <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isPositive === true ? 'bg-vdart-success/10 text-vdart-success' : isPositive === false ? 'bg-vdart-danger/10 text-vdart-danger' : 'bg-vdart-warning/10 text-vdart-warning'}`}>
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-bold text-vdart-muted uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-extrabold text-vdart-text tracking-tight">{value}</h3>
    </div>
    {sparklineData && (
      <div className="h-8 w-full mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
        <Line
          data={{
            labels: sparklineData.map((_, i) => i),
            datasets: [{ data: sparklineData, borderColor: isPositive ? '#10B981' : '#EF4444', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.4 }]
          }}
          options={{
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false,
            responsive: true
          }}
        />
      </div>
    )}
  </div>
);

const ChartCard = ({ title, className = "", children }) => (
  <div className={`glass-card p-6 flex flex-col ${className} h-full`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-bold text-sm text-vdart-text tracking-tight uppercase text-vdart-muted/80">{title}</h3>
      <div className="w-2 h-2 rounded-full bg-vdart-accent/20"></div>
    </div>
    <div className="flex-1 relative w-full flex flex-col justify-center">{children}</div>
  </div>
);

const TableCard = ({ title, className = "", children }) => (
  <div className={`glass-card flex flex-col h-full overflow-hidden ${className}`}>
    <div className="p-5 border-b border-white/20">
      <h3 className="font-bold text-sm text-vdart-text tracking-tight uppercase text-vdart-muted/80">{title}</h3>
    </div>
    <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

export default App;
