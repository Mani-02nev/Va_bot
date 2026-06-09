import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler, RadialLinearScale, RadarController
} from 'chart.js';
import { Bar, Scatter, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Home, LayoutDashboard, Code2, MessageSquare, BookOpen, Settings, Upload, Database,
  TrendingUp, Activity, BarChart2, AlertTriangle, CheckCircle2, Clock, Zap, FileText,
  Plus, ChevronLeft, ChevronRight, X, Download, Play, Loader2, Bot, User, Send,
  Globe, Sparkles, Star, Info, Target, RotateCcw, FolderOpen, Filter, Package,
  Eye, ChevronDown, Cpu, Layers, Hash, Type, Calendar, LogOut, LogIn, Shield, Lock,
  UserCircle2, BarChart3, Award, TrendingUp as TrendUp, Cloud, Trash2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

// ============================================================
// Supabase Client
// ============================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_READY = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT_REF') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
const supabase = SUPABASE_READY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


// ============================================================
// ChartJS Registration
// ============================================================
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler, RadialLinearScale, RadarController
);
ChartJS.defaults.font.family = "'Inter', 'Plus Jakarta Sans', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = '#fff';
ChartJS.defaults.plugins.tooltip.titleColor = '#0f172a';
ChartJS.defaults.plugins.tooltip.bodyColor = '#4b5563';
ChartJS.defaults.plugins.tooltip.borderColor = '#e2e8f0';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 11;
ChartJS.defaults.plugins.tooltip.cornerRadius = 10;
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.boxWidth = 8;
ChartJS.defaults.plugins.tooltip.boxHeight = 8;

// ============================================================
// Palette & Chart Options Factory
// ============================================================
const PALETTE = [
  '#0A2A66', '#1F5EDC', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16', '#fb923c',
  '#14b8a6', '#a855f7'
];
const PALETTE_ALPHA = (alpha = 0.72) => PALETTE.map(c => {
  const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
});

const getChartOpts = (type, extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 700, easing: 'easeInOutQuart' },
  plugins: {
    legend: {
      display: ['pie', 'doughnut', 'radar'].includes(type),
      position: 'bottom',
      labels: { boxWidth: 9, font: { size: 10 }, padding: 12 }
    }
  },
  scales: ['pie', 'doughnut'].includes(type) ? {} :
    type === 'radar' ? {
      r: { grid: { color: 'rgba(200,215,255,0.28)' }, ticks: { font: { size: 9 }, backdropColor: 'transparent', stepSize: 20 }, pointLabels: { font: { size: 9 } } }
    } : {
      x: { grid: { color: 'rgba(200,215,255,0.22)', drawBorder: false }, ticks: { font: { size: 10 }, color: '#6b7280', maxRotation: 35 } },
      y: { grid: { color: 'rgba(200,215,255,0.22)', drawBorder: false }, ticks: { font: { size: 10 }, color: '#6b7280' }, beginAtZero: true }
    },
  ...extra
});

// ============================================================
// Translations — EN & Tamil
// ============================================================
const LANG = {
  en: {
    appName: 'View Once', tagline: 'Complete Clarity', by: 'By Mr K AI Eco System',
    home: 'Home', dashboard: 'Dashboard', daDev: 'DA Developer', aiWorkspace: 'AI Workspace',
    tutorial: 'Tutorial', settings: 'Settings', myProjects: 'My Projects',
    selectMode: 'Choose Your Mode', bizMode: 'Business Mode',
    bizDesc: 'Simple visuals and plain-language insights. Perfect for managers and business users — no technical jargon.',
    devMode: 'DA Developer Mode',
    devDesc: 'Full automated pipeline: ingest → quality audit → clean → feature engineer → ML suggestions. For data professionals.',
    uploadCta: 'Upload Dataset', uploadHint: 'Drop a CSV file here, or click to browse',
    createProj: 'Create Project', projName: 'Project Name', projType: 'Project Type', create: 'Create',
    noDataMsg: 'Upload a dataset to begin. Your visuals will appear here automatically.',
    autoVisuals: 'Auto-Generated Visuals', visSub: 'charts created from your data — zero manual setup',
    kpiOverview: 'KPI Overview', totalRows: 'Total Rows', totalCols: 'Columns',
    numCols: 'Numeric', catCols: 'Categorical', dataHealth: 'Data Health',
    missingVals: 'Missing Values', duplicates: 'Duplicate Rows',
    pipelineTitle: 'DA Developer Pipeline', pipelineSub: '5-step automated data engineering — runs instantly on your dataset',
    runPipeline: 'Run Full Pipeline', dlClean: 'Download Cleaned CSV',
    s1t: 'Data Ingestion', s1d: 'Loading, parsing CSV and detecting column types, data ranges, and structure.',
    s2t: 'Quality Audit', s2d: 'Scanning for missing values, duplicates, outliers (Z-score > 3), and data integrity issues.',
    s3t: 'Auto Data Cleaning', s3d: 'Filling missing numerics with median, categoricals with mode. Removing fully blank rows.',
    s4t: 'Feature Engineering', s4d: 'Extracting date parts (year/month/weekday), creating ratio columns, adding high-value flags.',
    s5t: 'Model Suggestions', s5d: 'AI recommends the best ML algorithms (classification, regression, clustering) for your data.',
    chatWelcome: 'Hello! I am **Mr K AI Eco**, your intelligent data analytics agent.\n\nUpload a dataset and ask me anything — missing values, trends, ML model suggestions, or ask me to generate a chart!',
    chatPlaceholder: 'Ask anything about your data...', send: 'Send',
    quickQ: 'Quick Questions', noKey: '⚠️ Add your API key in **Settings** to enable AI responses.',
    apiConfig: 'API Key Configuration', apiLabel: 'Groq API Key',
    apiHint: 'Your key is stored locally and never sent to our servers.',
    apiPlaceholder: 'gsk_...', saveConfig: 'Save & Activate', clearKey: 'Clear Key',
    tutTitle: 'How to Use View Once', prev: 'Previous', next: 'Next', close: 'Close',
    status_pending: 'Pending', status_running: 'Running...', status_done: 'Completed',
    noDataUpload: 'No dataset loaded', loading: 'Loading...', langToggle: 'Language',
    howToUse: 'How to Use', recentProj: 'Recent Projects', export: 'Export CSV',
    featNew: 'New Features Created', cleanBefore: 'Before Cleaning', cleanAfter: 'After Cleaning',
    noMissing: 'No missing values — data is complete ✓'
  },
  ta: {
    appName: 'View Once', tagline: 'முழுமையான தெளிவு', by: 'Mr K AI Eco System மூலம்',
    home: 'முகப்பு', dashboard: 'டாஷ்போர்டு', daDev: 'DA டெவலப்பர்', aiWorkspace: 'AI பணியிடம்',
    tutorial: 'கற்றல்', settings: 'அமைவுகள்', myProjects: 'என் திட்டங்கள்',
    selectMode: 'உங்கள் பயன்முறையை தேர்வு செய்யுங்கள்', bizMode: 'வணிக பயன்முறை',
    bizDesc: 'எளிய காட்சிகள் மற்றும் எளிய மொழியில் நுண்ணறிவு. மேலாளர்கள் மற்றும் வணிக பயனர்களுக்கு ஏற்றது.',
    devMode: 'DA டெவலப்பர் பயன்முறை',
    devDesc: 'முழு தானியங்கி பைப்லைன்: உள்ளீடு → தர ஆய்வு → சுத்தம் → அம்ச பொறியியல் → ML பரிந்துரை.',
    uploadCta: 'தரவு ஏற்று', uploadHint: 'CSV கோப்பை இங்கு இழுக்கவும் அல்லது தேர்வு செய்யவும்',
    createProj: 'திட்டம் உருவாக்கு', projName: 'திட்ட பெயர்', projType: 'திட்ட வகை', create: 'உருவாக்கு',
    noDataMsg: 'தரவை ஏற்றி தொடங்குங்கள். உங்கள் காட்சிகள் தானாக தோன்றும்.',
    autoVisuals: 'தானியங்கி காட்சிகள்', visSub: 'வரைப்படங்கள் உங்கள் தரவிலிருந்து உருவாக்கப்பட்டன',
    kpiOverview: 'KPI கண்ணோட்டம்', totalRows: 'மொத்த வரிசைகள்', totalCols: 'நெடுவரிசைகள்',
    numCols: 'எண் வகை', catCols: 'வகை வகை', dataHealth: 'தரவு ஆரோக்கியம்',
    missingVals: 'காணாத மதிப்புகள்', duplicates: 'நகல் வரிசைகள்',
    pipelineTitle: 'DA டெவலப்பர் பைப்லைன்', pipelineSub: '5-படி தானியங்கி தரவு பொறியியல் செயல்முறை',
    runPipeline: 'பைப்லைன் இயக்கு', dlClean: 'சுத்தமான CSV பதிவிறக்கு',
    s1t: 'தரவு உள்ளீடு', s1d: 'CSV கோப்பை ஏற்று, நெடுவரிசை வகைகள், வரம்புகளை கண்டறிகிறது.',
    s2t: 'தர ஆய்வு', s2d: 'காணாத மதிப்புகள், நகல்கள், வெளிப்புற மதிப்புகளை ஆய்வு செய்கிறது.',
    s3t: 'தானியங்கி சுத்தம்', s3d: 'எண் மதிப்புகளை சராசரியுடன் நிரப்புகிறது, வகை மதிப்புகளை mode உடன் நிரப்புகிறது.',
    s4t: 'அம்ச பொறியியல்', s4d: 'தேதி அம்சங்களை பிரித்தெடுக்கிறது, விகித நெடுவரிசைகளை உருவாக்குகிறது.',
    s5t: 'மாதிரி பரிந்துரை', s5d: 'AI உங்கள் தரவிற்கு சிறந்த ML வழிமுறைகளை பரிந்துரைக்கிறது.',
    chatWelcome: 'வணக்கம்! நான் **Mr K AI Eco**, உங்கள் தரவு பகுப்பாய்வு முகவர்.\n\nதரவை ஏற்றி எதையும் கேளுங்கள் — காணாத மதிப்புகள், போக்குகள், ML பரிந்துரைகள், அல்லது வரைப்படம் உருவாக்கும்படி கேளுங்கள்!',
    chatPlaceholder: 'உங்கள் தரவைப் பற்றி கேளுங்கள்...', send: 'அனுப்பு',
    quickQ: 'விரைவு கேள்விகள்', noKey: '⚠️ AI பதில்களுக்கு **அமைவுகளில்** API கீயை சேர்க்கவும்.',
    apiConfig: 'API கீ அமைவு', apiLabel: 'Groq API கீ',
    apiHint: 'உங்கள் கீ உள்ளூரில் சேமிக்கப்படுகிறது, நமது சேவையகங்களுக்கு அனுப்பப்படுவதில்லை.',
    apiPlaceholder: 'gsk_...', saveConfig: 'சேமி & செயல்படுத்து', clearKey: 'அழி',
    tutTitle: 'View Once பயன்படுத்துவது எப்படி', prev: 'முந்தைய', next: 'அடுத்த', close: 'மூடு',
    status_pending: 'நிலுவையில்', status_running: 'இயங்குகிறது...', status_done: 'முடிந்தது',
    noDataUpload: 'தரவு இல்லை', loading: 'ஏற்றுகிறது...', langToggle: 'மொழி',
    howToUse: 'பயன்படுத்துவது எப்படி', recentProj: 'சமீபத்திய திட்டங்கள்', export: 'CSV ஏற்றுமதி',
    featNew: 'புதிய அம்சங்கள் உருவாக்கப்பட்டன', cleanBefore: 'சுத்தப்படுத்துவதற்கு முன்', cleanAfter: 'சுத்தப்படுத்திய பிறகு',
    noMissing: 'காணாத மதிப்புகள் இல்லை — தரவு முழுமையானது ✓'
  }
};

// ============================================================
// Project Types
// ============================================================
const PROJECT_TYPES = [
  'Company / HR Analytics', 'Sales & Revenue', 'Student Performance',
  'Healthcare / Medical', 'Web & Digital Analytics', 'Financial Analysis',
  'Inventory & Logistics', 'Customer Analytics', 'Custom / Other'
];

// ============================================================
// Tutorial Slides
// ============================================================
const TUTORIAL = {
  en: [
    {
      icon: '🎯', title: 'Welcome to View Once', sub: 'Your DA Agent — Complete Clarity',
      body: 'View Once is an intelligent Data Analytics Agent powered by Mr K AI Eco. Upload any CSV dataset and instantly get AI-generated visuals, automatic data cleaning, and smart insights — no coding needed.'
    },
    {
      icon: '📤', title: 'Upload Your Dataset', sub: 'Step 1: Get Started',
      body: 'Click the "Upload Dataset" button or drag-and-drop any CSV file. The system automatically detects every column type (Numeric, Categorical, Date), finds missing values, and computes your data health score instantly.'
    },
    {
      icon: '🔀', title: 'Choose Your Mode', sub: 'Business or DA Developer',
      body: '• Business Mode: Simple, clean visuals with plain-language explanations. No jargon. Perfect for managers.\n\n• DA Developer Mode: Full 5-step automated pipeline with data cleaning, feature engineering, outlier detection, and ML model recommendations.'
    },
    {
      icon: '📊', title: 'Auto-Generated Visuals', sub: 'Dashboard — 10+ Charts Instantly',
      body: 'After uploading, go to Dashboard. The AI automatically generates 10+ meaningful charts for your data — bar charts, scatter plots, histograms, pie charts, radar charts — all based on your actual columns. Zero manual setup.'
    },
    {
      icon: '🤖', title: 'Ask Mr K AI Eco', sub: 'AI Workspace — Chat with your Data',
      body: 'Open AI Workspace and chat with Mr K AI Eco. Try:\n• "What are the missing values in my data?"\n• "Show me a bar chart of sales by region"\n• "Which ML model should I use for this data?"\n\nThe bot generates charts directly inside the chat!'
    },
    {
      icon: '🔬', title: 'DA Developer Pipeline', sub: '5-Step Automated Process',
      body: 'In DA Developer mode, click "Run Full Pipeline":\n1. Data Ingestion — parse & detect types\n2. Quality Audit — missing values, outliers\n3. Auto Cleaning — fill nulls with median/mode\n4. Feature Engineering — date parts, ratio cols\n5. Model Suggestions — AI recommends ML algorithms\n\nDownload the cleaned dataset at the end.'
    },
    {
      icon: '🌐', title: 'Multi-Language Support', sub: 'English & Tamil',
      body: 'Toggle between English and தமிழ் using the language switch in the top bar. All UI labels, descriptions, tutorials, and even chatbot responses adapt to your selected language instantly.'
    },
  ],
  ta: [
    {
      icon: '🎯', title: 'View Once-க்கு வரவேற்கிறோம்', sub: 'உங்கள் DA முகவர் — முழுமையான தெளிவு',
      body: 'View Once என்பது Mr K AI Eco மூலம் இயக்கப்படும் ஒரு புத்திசாலித்தனமான தரவு பகுப்பாய்வு முகவர். எந்த CSV தரவையும் ஏற்றி, உடனடியாக AI காட்சிகள், தானியங்கி தரவு சுத்தம் மற்றும் நுண்ணறிவுகளை பெறுங்கள்.'
    },
    {
      icon: '📤', title: 'உங்கள் தரவை ஏற்றுக', sub: 'படி 1: தொடங்குங்கள்',
      body: '"தரவு ஏற்று" பொத்தானை அழுத்துங்கள் அல்லது CSV கோப்பை இழுத்து விடுங்கள். கணினி தானாகவே நெடுவரிசை வகைகளை கண்டறிந்து, காணாத மதிப்புகளை கண்டுபிடித்து, தரவு ஆரோக்கிய மதிப்பை கணக்கிடும்.'
    },
    {
      icon: '🔀', title: 'உங்கள் பயன்முறையை தேர்வு செய்யுங்கள்', sub: 'வணிகம் அல்லது DA டெவலப்பர்',
      body: '• வணிக பயன்முறை: எளிய காட்சிகள், எளிய மொழியில் விளக்கங்கள். மேலாளர்களுக்கு ஏற்றது.\n\n• DA டெவலப்பர் பயன்முறை: முழு 5-படி தானியங்கி பைப்லைன் — தரவு சுத்தம், அம்ச பொறியியல், ML பரிந்துரைகள்.'
    },
    {
      icon: '📊', title: 'தானியங்கி காட்சிகள்', sub: 'டாஷ்போர்டு — 10+ வரைப்படங்கள்',
      body: 'தரவை ஏற்றிய பிறகு, டாஷ்போர்டுக்கு செல்லுங்கள். AI தானாகவே 10+ அர்த்தமுள்ள வரைப்படங்களை உருவாக்கும். நீங்கள் எந்த அமைவும் செய்ய வேண்டாம்!'
    },
    {
      icon: '🤖', title: 'Mr K AI Eco கேளுங்கள்', sub: 'AI பணியிடம் — தரவுடன் பேசுங்கள்',
      body: 'AI பணியிடத்தை திறந்து Mr K AI Eco-உடன் பேசுங்கள்:\n• "என் தரவில் காணாத மதிப்புகள் என்ன?"\n• "பகுதி வாரியாக விற்பனை வரைப்படம் காட்டு"\n• "இந்த தரவிற்கு எந்த ML மாதிரி சிறந்தது?"\n\nசாட்டில் நேரடியாக வரைப்படங்களை பார்க்கலாம்!'
    },
    {
      icon: '🔬', title: 'DA டெவலப்பர் பைப்லைன்', sub: '5-படி தானியங்கி செயல்முறை',
      body: 'DA டெவலப்பர் பயன்முறையில் "பைப்லைன் இயக்கு" பொத்தானை அழுத்துங்கள்:\n1. தரவு உள்ளீடு\n2. தர ஆய்வு\n3. தானியங்கி சுத்தம்\n4. அம்ச பொறியியல்\n5. ML மாதிரி பரிந்துரை\n\nசுத்தமான தரவை பதிவிறக்கம் செய்யலாம்.'
    },
    {
      icon: '🌐', title: 'பல மொழி ஆதரவு', sub: 'ஆங்கிலம் & தமிழ்',
      body: 'மேல் பட்டியில் உள்ள மொழி மாற்று பொத்தானை பயன்படுத்தி ஆங்கிலம் மற்றும் தமிழுக்கு இடையே மாறுங்கள். UI விளக்கங்கள், கட்டுரைகள் மற்றும் சாட்பாட் பதில்கள் அனைத்தும் உங்கள் மொழியில் வரும்.'
    },
  ]
};

// ============================================================
// CSV Parser
// ============================================================
const parseCSV = (text) => {
  const lines = []; let row = ['']; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"') { if (inQ && n === '"') { row[row.length - 1] += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) row.push('');
    else if ((c === '\r' || c === '\n') && !inQ) {
      if (c === '\r' && n === '\n') i++;
      lines.push(row); row = [''];
    } else row[row.length - 1] += c;
  }
  if (row.length > 1 || row[0] !== '') lines.push(row);
  if (lines.length === 0) return [];
  const hdrs = lines[0].map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(r => r.length >= hdrs.length).map(r => {
    const obj = {};
    hdrs.forEach((h, i) => {
      let v = (r[i] || '').trim().replace(/^"|"$/g, '');
      obj[h] = (v !== '' && !isNaN(v)) ? Number(v) : v;
    });
    return obj;
  }).filter(r => Object.values(r).some(v => v !== '' && v !== null));
};

// ============================================================
// Schema Builder
// ============================================================
const buildSchemaInfo = (rows) => {
  if (!rows.length) return {};
  const headers = Object.keys(rows[0]);
  const info = {};
  headers.forEach(h => {
    const vals = rows.map(r => r[h]);
    const nonNull = vals.filter(v => v !== '' && v !== null && v !== undefined);
    const numericVals = nonNull.filter(v => !isNaN(v) && v !== '').map(Number);
    const isNumeric = nonNull.length > 0 && (numericVals.length / nonNull.length) > 0.8;
    const uniqueVals = new Set(nonNull.map(String));
    const missingCount = vals.filter(v => v === '' || v === null || v === undefined).length;
    let median = 0, mode = '', mean = 0;
    if (isNumeric && numericVals.length) {
      const s = [...numericVals].sort((a, b) => a - b);
      median = s[Math.floor(s.length / 2)];
      mean = numericVals.reduce((a, v) => a + v, 0) / numericVals.length;
    } else {
      const freq = {};
      nonNull.forEach(v => { const k = String(v); freq[k] = (freq[k] || 0) + 1; });
      mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    }
    const sample = rows.find(r => r[h] !== '' && r[h] !== null)?.[h];
    const isDate = !isNumeric && sample && /^\d{4}-\d{2}-\d{2}/.test(String(sample).trim());
    info[h] = {
      type: isNumeric ? 'Numeric' : 'Categorical',
      isDate, missingCount,
      missingPct: ((missingCount / rows.length) * 100).toFixed(1),
      uniqueCount: uniqueVals.size,
      sampleValues: Array.from(uniqueVals).slice(0, 3),
      median, mode, mean: parseFloat(mean.toFixed(2))
    };
  });
  return info;
};

// ============================================================
// Auto Visual Generator (12 charts)
// ============================================================
const buildAutoVisuals = (rows, headers, schema) => {
  if (!rows.length || !headers.length) return [];
  const P = PALETTE_ALPHA(0.78);
  const numCols = headers.filter(h => schema[h]?.type === 'Numeric');
  const catCols = headers.filter(h =>
    schema[h]?.type === 'Categorical' &&
    schema[h]?.uniqueCount >= 2 && schema[h]?.uniqueCount <= 35
  );
  const dateCols = headers.filter(h => schema[h]?.isDate);
  const boolCols = headers.filter(h => schema[h]?.type === 'Categorical' && schema[h]?.uniqueCount === 2);

  const aggByCat = (catC, numC, agg = 'sum', limit = 14) => {
    const g = {};
    rows.forEach(r => {
      const k = String(r[catC] || 'Unknown').slice(0, 22);
      const v = Number(r[numC]) || 0;
      if (!g[k]) g[k] = { sum: 0, count: 0 };
      g[k].sum += v; g[k].count++;
    });
    const keys = Object.keys(g).slice(0, limit);
    const vals = keys.map(k => agg === 'avg' ? parseFloat((g[k].sum / g[k].count).toFixed(2)) : parseFloat(g[k].sum.toFixed(2)));
    return { labels: keys, data: vals };
  };

  const countByCat = (catC, limit = 14) => {
    const g = {};
    rows.forEach(r => { const k = String(r[catC] || 'Unknown').slice(0, 22); g[k] = (g[k] || 0) + 1; });
    const keys = Object.keys(g).slice(0, limit);
    return { labels: keys, data: keys.map(k => g[k]) };
  };

  const buildHist = (numC, bins = 8) => {
    const vals = rows.map(r => Number(r[numC])).filter(v => !isNaN(v));
    if (!vals.length) return null;
    const mn = Math.min(...vals), mx = Math.max(...vals), sz = (mx - mn) / bins || 1;
    return {
      labels: Array.from({ length: bins }, (_, i) => `${(mn + i * sz).toFixed(1)}`),
      data: Array.from({ length: bins }, (_, i) => {
        const lo = mn + i * sz, hi = lo + sz;
        return vals.filter(v => v >= lo && v < hi).length;
      })
    };
  };

  const visuals = [];

  // V1 — Bar: catCol[0] × numCol[0]
  if (catCols[0] && numCols[0]) {
    const { labels, data } = aggByCat(catCols[0], numCols[0]);
    visuals.push({
      id: 'v1', type: 'bar',
      title: `${numCols[0]} by ${catCols[0]}`,
      subtitle: `Total ${numCols[0]} grouped by ${catCols[0]}`,
      data: { labels, datasets: [{ label: numCols[0], data, backgroundColor: P, borderRadius: 8 }] }
    });
  }

  // V2 — Pie: distribution of catCol[0]
  if (catCols[0]) {
    const { labels, data } = countByCat(catCols[0]);
    visuals.push({
      id: 'v2', type: 'pie',
      title: `${catCols[0]} Distribution`,
      subtitle: `Count breakdown across ${catCols[0]} categories`,
      data: { labels, datasets: [{ data, backgroundColor: P, borderWidth: 2, borderColor: '#fff' }] }
    });
  }

  // V3 — Scatter: numCol[0] vs numCol[1]
  if (numCols[0] && numCols[1]) {
    visuals.push({
      id: 'v3', type: 'scatter',
      title: `${numCols[0]} vs ${numCols[1]}`,
      subtitle: `Correlation analysis between two numeric variables`,
      data: {
        datasets: [{
          label: `${numCols[0]} vs ${numCols[1]}`,
          data: rows.slice(0, 200).map(r => ({ x: Number(r[numCols[0]]) || 0, y: Number(r[numCols[1]]) || 0 })),
          backgroundColor: 'rgba(31,94,220,0.52)', pointRadius: 5
        }]
      }
    });
  }

  // V4 — Histogram: numCol[0] distribution
  if (numCols[0]) {
    const hist = buildHist(numCols[0]);
    if (hist) visuals.push({
      id: 'v4', type: 'bar',
      title: `${numCols[0]} Distribution`,
      subtitle: `Frequency histogram — value spread analysis`,
      data: { labels: hist.labels, datasets: [{ label: 'Frequency', data: hist.data, backgroundColor: 'rgba(139,92,246,0.72)', borderRadius: 8 }] }
    });
  }

  // V5 — Doughnut: numCol[0] share by catCol[0]
  if (catCols[0] && numCols[0]) {
    const { labels, data } = aggByCat(catCols[0], numCols[0]);
    visuals.push({
      id: 'v5', type: 'doughnut',
      title: `${numCols[0]} Share by ${catCols[0]}`,
      subtitle: `Proportional contribution per category`,
      data: { labels, datasets: [{ data, backgroundColor: P, borderWidth: 2, borderColor: '#fff', cutout: '65%' }] }
    });
  }

  // V6 — Line: trend over time or row index
  if (dateCols[0] && numCols[0]) {
    const sorted = [...rows].sort((a, b) => String(a[dateCols[0]]).localeCompare(String(b[dateCols[0]])));
    const dg = {};
    sorted.forEach(r => { const k = String(r[dateCols[0]] || '').slice(0, 10); dg[k] = (dg[k] || 0) + (Number(r[numCols[0]]) || 0); });
    const keys = Object.keys(dg).slice(0, 25);
    if (keys.length > 1) visuals.push({
      id: 'v6', type: 'line',
      title: `${numCols[0]} Trend Over Time`,
      subtitle: `Time series — ${dateCols[0]}`,
      data: {
        labels: keys, datasets: [{
          label: numCols[0], data: keys.map(k => dg[k]),
          borderColor: '#1F5EDC', backgroundColor: 'rgba(31,94,220,0.07)',
          tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2
        }]
      }
    });
  } else if (numCols[0]) {
    const pts = rows.slice(0, 30).map((r, i) => ({ x: i + 1, y: Number(r[numCols[0]]) || 0 }));
    visuals.push({
      id: 'v6', type: 'line',
      title: `${numCols[0]} Trend (Row Sequence)`,
      subtitle: `Sequential value trend across records`,
      data: {
        labels: pts.map(d => `#${d.x}`), datasets: [{
          label: numCols[0], data: pts.map(d => d.y),
          borderColor: '#1F5EDC', backgroundColor: 'rgba(31,94,220,0.07)',
          tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2
        }]
      }
    });
  }

  // V7 — Bar: catCol[0] × numCol[1]
  if (catCols[0] && numCols[1]) {
    const { labels, data } = aggByCat(catCols[0], numCols[1], 'avg');
    visuals.push({
      id: 'v7', type: 'bar',
      title: `Avg ${numCols[1]} by ${catCols[0]}`,
      subtitle: `Average ${numCols[1]} per category`,
      data: { labels, datasets: [{ label: `Avg ${numCols[1]}`, data, backgroundColor: 'rgba(16,185,129,0.72)', borderRadius: 8 }] }
    });
  }

  // V8 — Grouped Bar: two numerics by category
  if (catCols[0] && numCols[0] && numCols[1]) {
    const { labels } = aggByCat(catCols[0], numCols[0]);
    const d1 = labels.map(l => { const f = rows.filter(r => String(r[catCols[0]]) === l); return f.length ? parseFloat((f.reduce((s, r) => s + (Number(r[numCols[0]]) || 0), 0) / f.length).toFixed(2)) : 0; });
    const d2 = labels.map(l => { const f = rows.filter(r => String(r[catCols[0]]) === l); return f.length ? parseFloat((f.reduce((s, r) => s + (Number(r[numCols[1]]) || 0), 0) / f.length).toFixed(2)) : 0; });
    visuals.push({
      id: 'v8', type: 'bar',
      title: `${numCols[0]} & ${numCols[1]} Comparison`,
      subtitle: `Side-by-side average comparison by ${catCols[0]}`,
      data: {
        labels, datasets: [
          { label: numCols[0], data: d1, backgroundColor: 'rgba(31,94,220,0.75)', borderRadius: 6 },
          { label: numCols[1], data: d2, backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6 }
        ]
      }
    });
  }

  // V9 — Radar: multi-metric (need 3+ numCols and catCols)
  if (numCols.length >= 3 && catCols[0]) {
    const cats = [...new Set(rows.map(r => String(r[catCols[0]] || 'Unknown')))].slice(0, 4);
    const rcols = numCols.slice(0, 5);
    const maxVals = rcols.map(c => Math.max(...rows.map(r => Number(r[c]) || 0)) || 1);
    const rds = cats.map((cat, idx) => {
      const cr = rows.filter(r => String(r[catCols[0]]) === cat);
      const data = rcols.map((c, ci) => { const avg = cr.reduce((s, r) => s + (Number(r[c]) || 0), 0) / (cr.length || 1); return parseFloat(((avg / maxVals[ci]) * 100).toFixed(1)); });
      return { label: cat.slice(0, 15), data, backgroundColor: PALETTE_ALPHA(0.15)[idx], borderColor: PALETTE[idx], borderWidth: 2, pointRadius: 4 };
    });
    visuals.push({
      id: 'v9', type: 'radar',
      title: `Multi-Metric Performance Radar`,
      subtitle: `${rcols.join(', ')} — normalized by ${catCols[0]}`,
      data: { labels: rcols.map(c => c.slice(0, 14)), datasets: rds }
    });
  }

  // V10 — Missing values chart OR data quality
  const missCols = headers.filter(h => schema[h]?.missingCount > 0);
  if (missCols.length) {
    visuals.push({
      id: 'v10', type: 'bar',
      title: `Missing Values by Column`,
      subtitle: `Data quality audit — columns with gaps`,
      data: { labels: missCols, datasets: [{ label: 'Missing Count', data: missCols.map(h => schema[h].missingCount), backgroundColor: 'rgba(239,68,68,0.68)', borderRadius: 8 }] }
    });
  } else {
    const hSlice = headers.slice(0, 8);
    visuals.push({
      id: 'v10', type: 'bar',
      title: `Data Completeness by Column`,
      subtitle: `100% complete — no missing values detected ✓`,
      data: { labels: hSlice, datasets: [{ label: 'Completeness %', data: hSlice.map(() => 100), backgroundColor: 'rgba(16,185,129,0.68)', borderRadius: 8 }] }
    });
  }

  // V11 — Scatter: numCol[1] vs numCol[2]
  if (numCols[1] && numCols[2]) {
    visuals.push({
      id: 'v11', type: 'scatter',
      title: `${numCols[1]} vs ${numCols[2]}`,
      subtitle: `Secondary correlation — finding hidden patterns`,
      data: {
        datasets: [{
          label: `${numCols[1]} vs ${numCols[2]}`,
          data: rows.slice(0, 200).map(r => ({ x: Number(r[numCols[1]]) || 0, y: Number(r[numCols[2]]) || 0 })),
          backgroundColor: 'rgba(245,158,11,0.55)', pointRadius: 5
        }]
      }
    });
  }

  // V12 — Top 10 by primary numeric
  if (numCols[0] && (catCols[0] || headers[0])) {
    const labelCol = catCols[0] || headers[0];
    const sorted = [...rows].sort((a, b) => (Number(b[numCols[0]]) || 0) - (Number(a[numCols[0]]) || 0));
    const top = sorted.slice(0, 10);
    visuals.push({
      id: 'v12', type: 'bar',
      title: `Top 10 by ${numCols[0]}`,
      subtitle: `Highest performing records`,
      data: { labels: top.map(r => String(r[labelCol] || '').slice(0, 16)), datasets: [{ label: numCols[0], data: top.map(r => Number(r[numCols[0]]) || 0), backgroundColor: P.slice(0, 10), borderRadius: 8 }] }
    });
  }

  // Fallback stats visual if < 10
  if (visuals.length < 10 && numCols[0]) {
    const vals = rows.map(r => Number(r[numCols[0]])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (vals.length) {
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const q1 = vals[Math.floor(vals.length * 0.25)], q3 = vals[Math.floor(vals.length * 0.75)];
      visuals.push({
        id: 'vstat', type: 'bar',
        title: `${numCols[0]} — Statistical Summary`,
        subtitle: `Min, Q1, Mean, Q3, Max overview`,
        data: {
          labels: ['Min', 'Q1 (25%)', 'Mean', 'Q3 (75%)', 'Max'],
          datasets: [{
            label: numCols[0], data: [vals[0], q1, mean, q3, vals[vals.length - 1]].map(v => parseFloat(v.toFixed(2))),
            backgroundColor: ['rgba(31,94,220,0.5)', 'rgba(31,94,220,0.65)', 'rgba(31,94,220,0.9)', 'rgba(31,94,220,0.65)', 'rgba(31,94,220,0.5)'],
            borderRadius: 8
          }]
        }
      });
    }
  }

  return visuals.filter(v => v && v.data);
};

// ============================================================
// DA Pipeline Functions
// ============================================================
const fillMissingValues = (rows, schema, opts = { useMean: false }) => rows.map(row => {
  const cleaned = { ...row };
  Object.keys(schema).forEach(col => {
    const v = cleaned[col];
    if (v === '' || v === null || v === undefined) {
      if (schema[col].type === 'Numeric') {
        cleaned[col] = opts.useMean ? (schema[col].mean || schema[col].median || 0) : (schema[col].median || schema[col].mean || 0);
      } else {
        cleaned[col] = schema[col].mode || 'Unknown';
      }
    }
  });
  return cleaned;
});

// Imputation helpers and UI actions
const imputeColumn = (rows, col, strategy, constant) => {
  if (!rows.length) return rows;
  const vals = rows.map(r => r[col]).filter(v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
  const numeric = vals.length > 0;
  const min = numeric ? Math.min(...vals) : undefined;
  const max = numeric ? Math.max(...vals) : undefined;
  const mean = numeric ? (vals.reduce((s,v)=>s+v,0)/vals.length) : undefined;
  const sorted = numeric ? [...vals].sort((a,b)=>a-b) : [];
  const median = numeric && sorted.length ? sorted[Math.floor(sorted.length/2)] : undefined;
  const mode = (() => { const freq = {}; rows.forEach(r=>{ const v = r[col]; if (v!=='' && v!==null && v!==undefined) { const k=String(v); freq[k]=(freq[k]||0)+1; }}); const ent = Object.entries(freq).sort((a,b)=>b[1]-a[1]); return ent[0]?.[0]; })();
  return rows.map(r=>{
    if (r[col]!=='' && r[col]!==null && r[col]!==undefined) return r;
    const out = { ...r };
    if (strategy === 'median' && median !== undefined) out[col] = median;
    else if (strategy === 'mean' && mean !== undefined) out[col] = parseFloat(mean.toFixed(2));
    else if (strategy === 'min' && min !== undefined) out[col] = min;
    else if (strategy === 'max' && max !== undefined) out[col] = max;
    else if (strategy === 'mode' && mode !== undefined) out[col] = mode;
    else if (strategy === 'constant') out[col] = (constant !== undefined ? constant : (numeric ? 0 : 'Unknown'));
    else out[col] = (numeric ? (median ?? mean ?? 0) : (mode || 'Unknown'));
    return out;
  });
};

const handleApplyImpute = (col) => {
  const strat = imputeStrategy[col] || 'median';
  const constVal = imputeConstant[col];
  const updated = imputeColumn(dataRows, col, strat, constVal);
  setDataRows(updated);
  setCleanedRows(updated);
};

const handleApplyImputeAll = () => {
  let updated = [...dataRows];
  Object.keys(schema).forEach(col => {
    const strat = imputeStrategy[col];
    if (strat) updated = imputeColumn(updated, col, strat, imputeConstant[col]);
  });
  setDataRows(updated);
  setCleanedRows(updated);
};

const engineerFeatures = (rows, headers, schema) => {
  const newFeatures = [];
  const enhanced = rows.map(r => ({ ...r }));
  headers.forEach(h => {
    const sample = rows.find(r => r[h] !== '' && r[h] !== null)?.[h];
    if (sample && /^\d{4}-\d{2}-\d{2}/.test(String(sample).trim())) {
      enhanced.forEach((row, i) => {
        const d = new Date(row[h]);
        if (!isNaN(d)) {
          enhanced[i][`${h}_year`] = d.getFullYear();
          enhanced[i][`${h}_month`] = d.getMonth() + 1;
          enhanced[i][`${h}_weekday`] = d.getDay();
        }
      });
      newFeatures.push(`${h}_year`, `${h}_month`, `${h}_weekday`);
    }
  });
  const numCols = headers.filter(h => schema[h]?.type === 'Numeric');
  if (numCols[0]) {
    const vals = rows.map(r => Number(r[numCols[0]]) || 0).sort((a, b) => a - b);
    const q75 = vals[Math.floor(vals.length * 0.75)];
    enhanced.forEach((row, i) => { enhanced[i][`${numCols[0]}_is_high`] = Number(row[numCols[0]]) >= q75 ? 'Yes' : 'No'; });
    newFeatures.push(`${numCols[0]}_is_high`);
  }
  if (numCols[0] && numCols[1]) {
    enhanced.forEach((row, i) => {
      const v2 = Number(row[numCols[1]]);
      enhanced[i][`${numCols[0]}_per_${numCols[1]}`] = v2 ? parseFloat((Number(row[numCols[0]]) / v2).toFixed(3)) : 0;
    });
    newFeatures.push(`${numCols[0]}_per_${numCols[1]}`);
  }
  return { enhanced, newFeatures };
};

const buildSystemPrompt = (rows, headers, schema, profile, fileName, lang, appMode) => {
  const langRule = lang === 'ta'
    ? 'CRITICAL RULE: You MUST respond in Tamil (தமிழ்) language. Write all explanations, descriptions, and analysis in Tamil script. Keep only column names, numbers, chart types, and technical code terms in English.'
    : 'Respond in clear, professional English.';
  const modeRule = appMode === 'business'
    ? 'TONE: Use simple, jargon-free language. Explain as if talking to a business manager who has no coding background.'
    : 'TONE: Use technical, professional language. Include algorithm names, statistical terms, code snippets where helpful.';
  return `You are "Mr K AI Eco", an intelligent data analytics agent built by "Mr K AI Eco System" (Created by Karuppasamy M).

IDENTITY RULES (CRITICAL):
- Your name is ALWAYS "Mr K AI Eco"
- NEVER mention Groq, OpenAI, Anthropic, Claude, Copilot, ChatGPT, LLaMA, or any AI brand/model name
- NEVER reveal the underlying model or API provider
- Always maintain the "Mr K AI Eco" identity

LANGUAGE: ${langRule}
${modeRule}

ACTIVE DATASET:
File: ${fileName || 'No file uploaded'}
Rows: ${rows.length.toLocaleString()} | Columns: ${headers.length}
Data Health: ${profile?.healthScore || 'N/A'}% | Missing Cells: ${profile?.totalMissing || 0}

COLUMN SCHEMA:
${headers.map(h => `• ${h}: ${schema[h]?.type || '?'} (unique=${schema[h]?.uniqueCount || 0}, missing=${schema[h]?.missingCount || 0})`).join('\n')}

SAMPLE (3 rows):
${JSON.stringify(rows.slice(0, 3), null, 2)}

CHART GENERATION — When user asks for a chart/visual, choose the BEST type and include EXACTLY this JSON block:

For standard charts (bar, line, pie, doughnut, scatter):
\`\`\`json
{
  "chart_type": "bar" | "line" | "pie" | "doughnut" | "scatter",
  "title": "Descriptive chart title",
  "labels": ["Category A", "Category B"],
  "data": [42, 87],
  "x_label": "X axis label",
  "y_label": "Y axis label"
}
\`\`\`

For BOX PLOTS — use when asked about distributions, spread, quartiles, outliers, or box plots:
\`\`\`json
{
  "chart_type": "boxplot",
  "title": "Distribution of [Column] by [Category]",
  "labels": ["Group A", "Group B", "Group C"],
  "data": [
    {"min": 10.0, "q1": 25.0, "median": 40.0, "q3": 60.0, "max": 80.0},
    {"min": 5.0, "q1": 20.0, "median": 35.0, "q3": 55.0, "max": 75.0}
  ]
}
\`\`\`
IMPORTANT: For box plots, calculate ACTUAL statistics from the sample data provided in context. Do NOT use placeholder values.

RESPONSE GUIDELINES:
- Explain how this data relates to AI/ML (classification, regression, clustering, time-series, etc.)
- Reference actual column names from the dataset
- Be specific with numbers and percentages
- For missing values: explain the impact and how to handle them
- For visuals: always generate the JSON block, then explain what it shows`;
};

// ============================================================
// Hoisted Display Components
// ============================================================

// Premium SVG Box Plot Component for AI Chat
const BoxPlotChart = ({ config }) => {
  const [tooltip, setTooltip] = useState(null);
  const labels = config.labels || [];
  const items = Array.isArray(config.data) ? config.data : [];
  if (!items.length) return null;

  const allVals = items.flatMap(d => [d.min, d.max].filter(v => v != null));
  const globalMin = Math.min(...allVals);
  const globalMax = Math.max(...allVals);
  const range = globalMax - globalMin || 1;
  const toX = v => ((v - globalMin) / range) * 100;

  const GRAD_COLORS = ['#1F5EDC', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16'];

  return (
    <div className="my-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative" style={{overflow:'visible'}}>
      {config.title && <p className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-wider">{config.title}</p>}
      <div className="space-y-4">
        {items.map((d, i) => {
          const color = GRAD_COLORS[i % GRAD_COLORS.length];
          const minX = toX(d.min ?? globalMin);
          const q1X = toX(d.q1 ?? d.min ?? globalMin);
          const medX = toX(d.median ?? ((d.q1 + d.q3) / 2));
          const q3X = toX(d.q3 ?? d.max ?? globalMax);
          const maxX = toX(d.max ?? globalMax);
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 text-[10px] font-bold text-slate-600 text-right truncate flex-shrink-0">
                {labels[i] || `Group ${i + 1}`}
              </div>
              <div className="flex-1 relative h-8 cursor-crosshair"
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ i, xPx: e.clientX - rect.left, yPx: e.clientY - rect.top, ...d, label: labels[i] || `Group ${i+1}` });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="overflow-visible">
                  {/* Whisker connecting line */}
                  <line x1={`${minX}%`} y1="16" x2={`${maxX}%`} y2="16" stroke={color} strokeWidth="1.5" strokeOpacity="0.35" />
                  {/* Min whisker cap */}
                  <line x1={`${minX}%`} y1="10" x2={`${minX}%`} y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                  {/* Max whisker cap */}
                  <line x1={`${maxX}%`} y1="10" x2={`${maxX}%`} y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                  {/* IQR box */}
                  <rect x={`${q1X}%`} y="7" width={`${Math.max(q3X - q1X, 0.5)}%`} height="18" rx="3" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5" />
                  {/* Median line */}
                  <line x1={`${medX}%`} y1="6" x2={`${medX}%`} y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                  {/* Median dot */}
                  <circle cx={`${medX}%`} cy="16" r="4" fill={color} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis scale labels */}
      <div className="flex justify-between mt-2 pl-28 text-[9px] text-slate-400">
        <span>{globalMin.toFixed(1)}</span>
        <span>{((globalMin + globalMax) / 2).toFixed(1)}</span>
        <span>{globalMax.toFixed(1)}</span>
      </div>
      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[9999] bg-slate-900 text-white text-[10px] rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none border border-slate-700"
          style={{ left: tooltip.xPx + 160, top: tooltip.yPx + 80, minWidth: 140, transform: 'translateY(-50%)' }}
        >
          <p className="font-black mb-1.5 text-blue-300 border-b border-slate-700 pb-1">{tooltip.label}</p>
          <p className="flex justify-between gap-3">Max <span className="font-bold text-emerald-300">{tooltip.max?.toFixed(2)}</span></p>
          <p className="flex justify-between gap-3">Q3 <span className="font-bold text-white">{tooltip.q3?.toFixed(2)}</span></p>
          <p className="flex justify-between gap-3">Median <span className="font-bold text-yellow-300">{tooltip.median?.toFixed(2)}</span></p>
          <p className="flex justify-between gap-3">Q1 <span className="font-bold text-white">{tooltip.q1?.toFixed(2)}</span></p>
          <p className="flex justify-between gap-3">Min <span className="font-bold text-red-300">{tooltip.min?.toFixed(2)}</span></p>
        </div>
      )}
    </div>
  );
};

// Chat Message — supports markdown + embedded charts
const ChatMessage = ({ msg }) => {
  if (msg.role === 'user') return <span>{msg.text}</span>;
  const parts = msg.text.split(/```json\n([\s\S]*?)\n```/);
  if (parts.length === 1) return <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>;
  return (
    <>
      {parts.map((part, i) => {

        if (i % 2 === 1) {
          try {
            const cfg = JSON.parse(part);
            if (cfg.chart_type) return <ChatChart key={i} config={cfg} />;
          } catch { /* skip */ }
          return <pre key={i} className="text-[10px] bg-slate-100 p-2 rounded overflow-x-auto">{part}</pre>;
        }
        return <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part}</ReactMarkdown>;
      })}
    </>
  );
};

// Small chart embedded in chat
const ChatChart = ({ config }) => {
  if (config.chart_type === 'boxplot') return <BoxPlotChart config={config} />;
  const opts = getChartOpts(config.chart_type);
  const data = {
    labels: config.labels || [],
    datasets: [{ label: config.title || 'Data', data: config.data || [], backgroundColor: PALETTE_ALPHA(0.78), borderColor: config.chart_type === 'line' ? '#1F5EDC' : '#fff', borderWidth: config.chart_type === 'line' ? 2 : 1.5, pointRadius: 4, cutout: config.chart_type === 'doughnut' ? '60%' : undefined, tension: 0.35 }]
  };
  return (
    <div className="my-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
      {config.title && <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-wider">{config.title}</p>}
      <div style={{ height: 220 }}>
        {config.chart_type === 'bar' && <Bar data={data} options={opts} />}
        {config.chart_type === 'line' && <Line data={data} options={opts} />}
        {config.chart_type === 'pie' && <Pie data={data} options={opts} />}
        {config.chart_type === 'doughnut' && <Doughnut data={data} options={opts} />}
        {config.chart_type === 'scatter' && <Scatter data={data} options={opts} />}
      </div>
    </div>
  );
};

// Auto-Visual card (Dashboard)
const VisualCard = ({ visual }) => {
  const opts = getChartOpts(visual.type);
  return (
    <div className="glass-card overflow-hidden flex flex-col anim-fade-slide">
      <div className="chart-header px-5 py-3 flex-shrink-0">
        <p className="font-bold text-xs text-slate-700 truncate leading-tight">{visual.title}</p>
        {visual.subtitle && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{visual.subtitle}</p>}
      </div>
      <div className="flex-1 p-4" style={{ minHeight: 210, maxHeight: 240 }}>
        {visual.type === 'bar' && <Bar data={visual.data} options={opts} />}
        {visual.type === 'line' && <Line data={visual.data} options={opts} />}
        {visual.type === 'pie' && <Pie data={visual.data} options={opts} />}
        {visual.type === 'doughnut' && <Doughnut data={visual.data} options={opts} />}
        {visual.type === 'scatter' && <Scatter data={visual.data} options={opts} />}
        {visual.type === 'radar' && <Radar data={visual.data} options={opts} />}
      </div>
    </div>
  );
};

// KPI card
const KpiCard = ({ title, value, sub, icon: Icon, klass = 'kpi-blue', color = '#1F5EDC' }) => (
  <div className={`glass-card p-5 flex flex-col gap-2 ${klass} anim-fade-slide`}>
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `rgba(${color === '#1F5EDC' ? '31,94,220' : color === '#10b981' ? '16,185,129' : color === '#f59e0b' ? '245,158,11' : color === '#ef4444' ? '239,68,68' : '139,92,246'},0.12)` }}>
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{value}</h3>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Pipeline step card
const StepCard = ({ stepKey, statusMap, stepDefs, T, manualMode = false, onRun }) => {
  const def = stepDefs[stepKey];
  const status = statusMap[stepKey] || 'pending';
  const icons = { pending: <Clock size={16} className="text-slate-400" />, running: <Loader2 size={16} className="text-blue-500 anim-spin" />, done: <CheckCircle2 size={16} className="text-emerald-500" /> };
  return (
    <div className={`step-card p-5 flex gap-4 items-start step-${status}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${status === 'done' ? 'bg-emerald-100 text-emerald-700' : status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{def.num}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm text-slate-800">{def.title}</p>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${status === 'done' ? 'bg-emerald-100 text-emerald-700' : status === 'running' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{T(`status_${status}`)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{def.desc}</p>
        {status === 'running' && (
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="progress-bar h-1" style={{ width: '100%', animation: 'progressGrow 1.8s ease-in-out infinite alternate' }} />
          </div>
        )}
        {manualMode && status !== 'running' && status !== 'done' && (
          <div className="mt-3">
            <button onClick={() => onRun && onRun(stepKey)} className="btn-primary px-3 py-1 text-xs">Run Step</button>
            <p className="text-[11px] text-slate-400 mt-2">Guide: {def.desc}</p>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 mt-0.5">{icons[status]}</div>
    </div>
  );
};

// Tutorial Modal
const TutorialModal = ({ lang, onClose }) => {
  const [slide, setSlide] = useState(0);
  const slides = TUTORIAL[lang] || TUTORIAL.en;
  const T = (k) => LANG[lang]?.[k] || LANG.en[k] || k;
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') setSlide(s => Math.min(s + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const cur = slides[slide];
  return (
    <div className="modal-overlay anim-fade" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel w-full max-w-2xl mx-4 anim-scale" style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><BookOpen size={18} className="text-blue-600" /></div>
            <div>
              <p className="font-black text-sm text-slate-800">{T('tutTitle')}</p>
              <p className="text-xs text-slate-400">{slide + 1} / {slides.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><X size={16} /></button>
        </div>
        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-1 rounded-full" style={{ width: `${((slide + 1) / slides.length) * 100}%`, background: 'linear-gradient(90deg,#0A2A66,#1F5EDC)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div key={slide} className="anim-fade text-center mb-6">
            <div className="text-6xl mb-4">{cur.icon}</div>
            <h2 className="text-2xl font-black gradient-text mb-1">{cur.title}</h2>
            <p className="text-sm text-blue-600 font-semibold mb-5">{cur.sub}</p>
            <div className="text-left bg-slate-50 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{cur.body}</div>
          </div>
          {/* Slide dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: i === slide ? '#1F5EDC' : '#e2e8f0', width: i === slide ? '20px' : '8px' }}
              />
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0 gap-3">
          <button onClick={() => setSlide(s => Math.max(s - 1, 0))} disabled={slide === 0}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 disabled:opacity-40">
            <ChevronLeft size={14} />{T('prev')}
          </button>
          {slide < slides.length - 1
            ? <button onClick={() => setSlide(s => s + 1)} className="btn-primary px-6 py-2.5 flex items-center gap-2">{T('next')}<ChevronRight size={14} /></button>
            : <button onClick={onClose} className="btn-primary px-6 py-2.5 flex items-center gap-2"><CheckCircle2 size={14} />{T('close')}</button>
          }
        </div>
      </div>
    </div>
  );
};

// Project Create Modal
const ProjectModal = ({ onSave, onClose, fileName, previewRows, lang }) => {
  const [name, setName] = useState(fileName?.replace('.csv', '').replace(/_/g, ' ') || 'My Project');
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const T = (k) => LANG[lang]?.[k] || LANG.en[k] || k;
  return (
    <div className="modal-overlay anim-fade" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel w-full max-w-lg mx-4 p-7 anim-scale">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"><Plus size={20} className="text-blue-600" /></div>
          <div>
            <h2 className="font-black text-lg text-slate-800">{T('createProj')}</h2>
            <p className="text-xs text-slate-400">{fileName} — {previewRows} rows detected</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">{T('projName')}</label>
            <input className="glass-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q1 Sales Analysis" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">{T('projType')}</label>
            <select className="glass-input" value={type} onChange={e => setType(e.target.value)}>
              {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-3">{LANG[lang]?.close || 'Cancel'}</button>
          <button onClick={() => onSave(name.trim() || 'My Project', type)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            <Sparkles size={14} />{T('create')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State
const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center"><Icon size={28} className="text-blue-300" /></div>
    <div><p className="font-black text-slate-700 text-base mb-1">{title}</p><p className="text-sm text-slate-400 max-w-xs">{desc}</p></div>
    {action}
  </div>
);

// ============================================================
// Main App Component
// ============================================================
const App = () => {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  const isEnvKey = envKey && envKey !== 'YOUR_GROQ_API_KEY_HERE';

  // ---- States ----
  const [lang, setLang] = useState('en');
  const [appMode, setAppMode] = useState(null); // null | 'business' | 'developer'
  const [currentPage, setCurrentPage] = useState('home');
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [cleanedRows, setCleanedRows] = useState([]);
  const [engineeredData, setEngineeredData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [groqKey, setGroqKey] = useState(isEnvKey ? envKey : (localStorage.getItem('vo_groq_key') || ''));
  const [tempKey, setTempKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [miniInput, setMiniInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isMiniOpen, setIsMiniOpen] = useState(false);
  const [isTutOpen, setIsTutOpen] = useState(false);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingRows, setPendingRows] = useState(0);
  const [pipeStatus, setPipeStatus] = useState({});
  const [pipeRunning, setPipeRunning] = useState(false);
  const [tutSlide, setTutSlide] = useState(0);
  const fileInputRef = useRef(null);
  const msgEndRef = useRef(null);
  const miniMsgEndRef = useRef(null);
  const [imputeStrategy, setImputeStrategy] = useState({});
  const [imputeConstant, setImputeConstant] = useState({});
  const [pipelineMode, setPipelineMode] = useState('auto'); // 'auto' | 'manual'

  // ---- Supabase Auth States ----
  const [supaUser, setSupaUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [dbSyncing, setDbSyncing] = useState(false);

  // Translation helper
  const T = (k) => LANG[lang]?.[k] || LANG.en[k] || k;

  // ---- Computed ----
  const headers = useMemo(() => dataRows.length ? Object.keys(dataRows[0]) : [], [dataRows]);
  const schema = useMemo(() => buildSchemaInfo(dataRows), [dataRows]);

  const dataProfile = useMemo(() => {
    if (!dataRows.length || !headers.length) return null;
    const numCols = headers.filter(h => schema[h]?.type === 'Numeric');
    const catCols = headers.filter(h => schema[h]?.type === 'Categorical');
    const totalCells = dataRows.length * headers.length;
    const totalMissing = headers.reduce((s, h) => s + (schema[h]?.missingCount || 0), 0);
    const healthScore = ((1 - totalMissing / totalCells) * 100).toFixed(1);
    const dupRows = dataRows.length - new Set(dataRows.map(r => JSON.stringify(r))).size;
    const outlierCols = headers.filter(h => {
      if (schema[h]?.type !== 'Numeric') return false;
      const vals = dataRows.map(r => Number(r[h])).filter(v => !isNaN(v));
      if (vals.length < 4) return false;
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
      return vals.some(v => Math.abs(v - mean) > 3 * std);
    });
    return { rowCount: dataRows.length, colCount: headers.length, numericColCount: numCols.length, categoricalColCount: catCols.length, totalMissing, missingPct: ((totalMissing / totalCells) * 100).toFixed(1), healthScore, dupRows, outlierCols, numCols, catCols };
  }, [dataRows, headers, schema]);

  const autoVisuals = useMemo(() => {
    if (!dataRows.length) return [];
    return buildAutoVisuals(dataRows, headers, schema);
  }, [dataRows, headers, schema]);

  // Step definitions for DA pipeline
  const stepDefs = {
    step1: { num: '01', title: T('s1t'), desc: T('s1d') },
    step2: { num: '02', title: T('s2t'), desc: T('s2d') },
    step3: { num: '03', title: T('s3t'), desc: T('s3d') },
    step4: { num: '04', title: T('s4t'), desc: T('s4d') },
    step5: { num: '05', title: T('s5t'), desc: T('s5d') }
  };

  // ---- Effects ----
  useEffect(() => {
    setMessages([{ role: 'bot', text: T('chatWelcome') + (groqKey ? '\n\n✅ **API Key is active.** I\'m ready to analyze your data!' : `\n\n${T('noKey')}`) }]);
  }, [lang, groqKey]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (isMiniOpen) miniMsgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isMiniOpen]);

  // ---- Supabase Auth Init ----
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupaUser(session?.user ?? null);
      if (session?.user) loadProjectsFromDB(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupaUser(session?.user ?? null);
      if (session?.user) loadProjectsFromDB(session.user.id);
      else setProjects([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ---- Supabase DB Helpers ----
  const loadProjectsFromDB = async (userId) => {
    if (!supabase) return;
    setDbSyncing(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, type, file_name, row_count, col_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setProjects((data || []).map(p => ({
        id: p.id, name: p.name, type: p.type, fileName: p.file_name,
        rowCount: p.row_count, colCount: p.col_count, timestamp: p.created_at
      })));
    } catch (err) {
      console.warn('Supabase load error:', err.message);
    } finally { setDbSyncing(false); }
  };

  const saveProjectToDB = async (proj, rows, msgs) => {
    if (!supabase || !supaUser) return;
    try {
      await supabase.from('projects').upsert({
        id: proj.id, user_id: supaUser.id, name: proj.name, type: proj.type,
        file_name: proj.fileName, row_count: proj.rowCount, col_count: proj.colCount,
        data_rows: rows, messages: msgs || []
      }, { onConflict: 'id' });
    } catch (err) { console.warn('Supabase save error:', err.message); }
  };

  const syncMessagesToDB = useCallback(async (msgs) => {
    if (!supabase || !supaUser || !activeProjectId) return;
    try { await supabase.from('projects').update({ messages: msgs }).eq('id', activeProjectId).eq('user_id', supaUser.id); }
    catch { /* silent */ }
  }, [supaUser, activeProjectId]);

  const syncCleanedRowsToDB = useCallback(async (rows) => {
    if (!supabase || !supaUser || !activeProjectId) return;
    try { await supabase.from('projects').update({ cleaned_rows: rows }).eq('id', activeProjectId).eq('user_id', supaUser.id); }
    catch { /* silent */ }
  }, [supaUser, activeProjectId]);

  // ---- Supabase Auth Actions ----
  const handleAuthSignIn = async (e) => {
    e.preventDefault();
    if (!supabase) { setAuthError('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'); return; }
    setAuthLoading(true); setAuthError(''); setAuthSuccess('');
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthLoading(false);
    if (error) setAuthError(error.message);
    else { setAuthModalOpen(false); setAuthEmail(''); setAuthPassword(''); }
  };

  const handleAuthSignUp = async (e) => {
    e.preventDefault();
    if (!supabase) { setAuthError('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'); return; }
    setAuthLoading(true); setAuthError(''); setAuthSuccess('');
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName } } });
    setAuthLoading(false);
    if (error) setAuthError(error.message);
    else setAuthSuccess('Account created! Check your email to confirm, then sign in.');
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSupaUser(null); setProjects([]); setDataRows([]); setCleanedRows([]);
    setActiveProjectId(null); setFileName(''); setCurrentPage('home');
  };

  // ---- File Upload ----
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result);
      setPendingFile({ file, text: ev.target.result });
      setPendingRows(rows.length);
      setIsProjModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProjectCreate = async (projName, projType) => {
    if (!pendingFile) return;
    setLoading(true);
    setIsProjModalOpen(false);
    const rows = parseCSV(pendingFile.text);
    const newProj = { id: Date.now().toString(), name: projName, type: projType, fileName: pendingFile.file.name, timestamp: new Date().toISOString(), rowCount: rows.length, colCount: rows.length ? Object.keys(rows[0]).length : 0 };
    setProjects(prev => [newProj, ...prev.slice(0, 9)]);
    setActiveProjectId(newProj.id);
    setDataRows(rows);
    setCleanedRows([]);
    setEngineeredData(null);
    setPipeStatus({});
    setFileName(pendingFile.file.name);
    setPendingFile(null);
    setLoading(false);
    setCurrentPage('dashboard');
    setMessages(prev => [...prev, { role: 'bot', text: `📊 **Project "${projName}" loaded!**\n\n- File: ${pendingFile.file.name}\n- Type: ${projType}\n- Rows: ${rows.length.toLocaleString()}\n- Columns: ${rows.length ? Object.keys(rows[0]).length : 0}\n\nI've auto-generated **${Math.min(autoVisuals.length || 12, 12)} visualizations** for your data. Ask me anything!` }]);
    if (supaUser) await saveProjectToDB(newProj, rows, []);
  };

  // ---- DA Pipeline ----
  const handleRunPipeline = async () => {
    if (!dataRows.length || pipeRunning) return;
    if (pipelineMode === 'manual') {
      // In manual mode, instruct user to run individual steps
      setPipeStatus({ step1: 'pending', step2: 'pending', step3: 'pending', step4: 'pending', step5: 'pending' });
      setMessages(prev => [...prev, { role: 'bot', text: '**Manual mode active.** Run each pipeline step below using the Run button and review outputs before proceeding.' }]);
      return;
    }
    // Auto mode: run full pipeline quickly
    setPipeRunning(true);
    setPipeStatus({ step1: 'running', step2: 'pending', step3: 'pending', step4: 'pending', step5: 'pending' });
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    await delay(900); setPipeStatus(s => ({ ...s, step1: 'done', step2: 'running' }));
    await delay(900); setPipeStatus(s => ({ ...s, step2: 'done', step3: 'running' }));
    const filled = fillMissingValues(dataRows, schema, { useMean: pipelineMode === 'manual' });
    setCleanedRows(filled);
    await delay(700); setPipeStatus(s => ({ ...s, step3: 'done', step4: 'running' }));
    const { enhanced, newFeatures } = engineerFeatures(filled, headers, schema);
    setEngineeredData({ rows: enhanced, newFeatures });
    await delay(900); setPipeStatus(s => ({ ...s, step4: 'done', step5: 'running' }));
    await delay(600); setPipeStatus(s => ({ ...s, step5: 'done' }));
    setPipeRunning(false);
  };

  // Run an individual pipeline step (manual mode)
  const runStep = async (stepKey) => {
    if (!dataRows.length) return;
    if (pipeRunning) return;
    setPipeRunning(true);
    setPipeStatus(s => ({ ...s, [stepKey]: 'running' }));
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    try {
      if (stepKey === 'step1') {
        // Ingestion — already loaded, simulate validation
        await delay(600);
        setPipeStatus(s => ({ ...s, step1: 'done' }));
      } else if (stepKey === 'step2') {
        await delay(700);
        setPipeStatus(s => ({ ...s, step2: 'done' }));
      } else if (stepKey === 'step3') {
        const filled = fillMissingValues(dataRows, schema, { useMean: pipelineMode === 'manual' });
        setCleanedRows(filled);
        await delay(700);
        setPipeStatus(s => ({ ...s, step3: 'done' }));
      } else if (stepKey === 'step4') {
        const base = cleanedRows.length ? cleanedRows : dataRows;
        const { enhanced, newFeatures } = engineerFeatures(base, headers, schema);
        setEngineeredData({ rows: enhanced, newFeatures });
        await delay(700);
        setPipeStatus(s => ({ ...s, step4: 'done' }));
      } else if (stepKey === 'step5') {
        await delay(600);
        setPipeStatus(s => ({ ...s, step5: 'done' }));
      }
    } finally {
      setPipeRunning(false);
    }
  };

  const handleExportClean = () => {
    const rows = cleanedRows.length ? cleanedRows : dataRows;
    if (!rows.length) return;
    const csvH = Object.keys(rows[0]).join(',');
    const csvR = rows.map(r => Object.values(r).map(v => typeof v === 'string' ? `"${v}"` : v).join(','));
    const blob = new Blob([[csvH, ...csvR].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `cleaned_${fileName || 'data'}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Chat ----
  const handleSendMessage = async (e, quickText = null, isMini = false) => {
    if (e) e.preventDefault();
    const text = quickText || (isMini ? miniInput : inputMessage);
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    if (isMini) setMiniInput(''); else setInputMessage('');
    setChatLoading(true);
    if (!groqKey) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ AI not available. Sign in to enable AI responses (see Settings).' }]);
      setChatLoading(false); return;
    }
    const sysPrompt = buildSystemPrompt(dataRows, headers, schema, dataProfile, fileName, lang, appMode);
    // fetch with retry/backoff for HTTP 429 and network errors
    const fetchWithRetry = async (url, opts = {}, retries = 6, baseDelay = 700, maxTotalMs = 60000) => {
      const start = Date.now();
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, opts);
          if (res.status === 429) {
            // Respect Retry-After header when present
            const ra = res.headers.get('Retry-After');
            let wait = ra ? Number(ra) * 1000 : Math.min(baseDelay * Math.pow(2, i), 10000);
            // add small jitter
            wait = Math.max(250, wait + Math.floor(Math.random() * 400) - 200);
            // bail out if we've already waited too long
            if (Date.now() + wait - start > maxTotalMs) break;
            await new Promise(r => setTimeout(r, wait));
            continue;
          }
          return res;
        } catch (err) {
          // network error — retry with exponential backoff
          const wait = Math.min(baseDelay * Math.pow(2, i) + Math.floor(Math.random() * 300), 15000);
          if (Date.now() + wait - start > maxTotalMs || i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, wait));
        }
      }
      throw new Error('Max retries reached or server unavailable. Try again later.');
    };

    try {
      const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: sysPrompt },
            ...messages.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: text }
          ],
          temperature: 0.3, max_tokens: 2000
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: json.choices[0].message.content }]);
    } catch (err) {
      const friendly = err.message && err.message.includes('429') ? 'Too many requests — the AI service is rate-limiting. Try again in a few moments.' : err.message || 'Connection error. Try again later.';
      setMessages(prev => [...prev, { role: 'bot', text: `❌ **Connection Error:** ${friendly}` }]);
    } finally { setChatLoading(false); }
  };

  const handleSaveSettings = () => {
    setGroqKey(tempKey);
    localStorage.setItem('vo_groq_key', tempKey);
  };

  // ---- Quick Questions ----
  const quickQuestions = lang === 'ta' ? [
    'என் தரவில் காணாத மதிப்புகள் என்ன?',
    'முக்கிய போக்குகளை சுருக்கமாக சொல்லுங்கள்',
    'இந்த தரவு AI-க்கு எப்படி பயன்படும்?',
    'ஒரு வரைப்படம் காட்டுங்கள்',
    'அசாதாரண மதிப்புகள் இருக்கிறதா?'
  ] : [
    'What are the missing values in my data?',
    'Summarize the key trends',
    'How is this data useful for AI/ML?',
    'Show me a bar chart',
    'Are there any outliers or anomalies?'
  ];

  // ============================================================
  // PAGE RENDERS
  // ============================================================

  // --- HOME PAGE ---
  const renderHome = () => (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 anim-fade">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
          <Sparkles size={12} className="text-blue-500" />
          <span className="text-xs font-bold text-blue-600">{T('by')}</span>
        </div>
        <h1 className="text-4xl font-black gradient-text mb-2">{T('appName')}</h1>
        <p className="text-slate-500 text-base font-semibold">{T('tagline')}</p>
      </div>

      {/* Mode Selector */}
      {!appMode ? (
        <div>
          <p className="text-center text-sm font-black text-slate-600 uppercase tracking-widest mb-5">{T('selectMode')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {[
              { key: 'business', icon: '🏢', label: T('bizMode'), desc: T('bizDesc'), badge: 'mode-badge-biz', badgeLabel: 'Business', color: '#10b981' },
              { key: 'developer', icon: '🔬', label: T('devMode'), desc: T('devDesc'), badge: 'mode-badge-dev', badgeLabel: 'DA Developer', color: '#8b5cf6' }
            ].map(m => (
              <button key={m.key} onClick={() => setAppMode(m.key)}
                className="glass-card p-7 text-left hover:border-blue-200 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{m.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-800 text-base">{m.label}</h3>
                      <span className={m.badge}>{m.badgeLabel}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold" style={{ color: m.color }}>
                  <span>Select this mode</span><ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 glass-card p-4">
          <span className={appMode === 'business' ? 'mode-badge-biz' : 'mode-badge-dev'}>{appMode === 'business' ? 'Business' : 'DA Developer'}</span>
          <span className="text-xs text-slate-500 font-semibold">mode active</span>
          <button onClick={() => setAppMode(null)} className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><RotateCcw size={11} />Change mode</button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="upload-zone p-12 text-center mb-8" onClick={() => fileInputRef.current?.click()}>
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Upload size={26} className="text-blue-500" />
        </div>
        <h3 className="font-black text-slate-700 text-base mb-1">{T('uploadCta')}</h3>
        <p className="text-sm text-slate-400">{T('uploadHint')}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors">
          <Upload size={14} />{T('uploadCta')}
        </div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{T('recentProj')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => { setActiveProjectId(p.id); setCurrentPage('dashboard'); }}
                className={`glass-card p-4 text-left transition-all ${p.id === activeProjectId ? 'border-blue-300 bg-blue-50/70' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><FolderOpen size={15} className="text-blue-600" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.type}</p>
                    <p className="text-[10px] text-slate-400">{p.rowCount.toLocaleString()} rows · {p.colCount} cols</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">{T('noDataMsg')}</p>
        </div>
      )}
    </div>
  );

  // --- DASHBOARD PAGE ---
  const renderDashboard = () => {
    if (!dataRows.length) return (
      <div className="p-8 flex items-center justify-center h-full">
        <EmptyState icon={BarChart2} title={T('noDataUpload')} desc={T('noDataMsg')}
          action={<button onClick={() => fileInputRef.current?.click()} className="btn-primary px-5 py-2.5 flex items-center gap-2"><Upload size={14} />{T('uploadCta')}</button>}
        />
      </div>
    );
    return (
      <div className="p-6 max-w-full overflow-y-auto custom-scrollbar h-full">
        {/* KPI Row */}
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{T('kpiOverview')}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <KpiCard title={T('totalRows')} value={dataProfile?.rowCount?.toLocaleString() || '—'} icon={Database} klass="kpi-blue" color="#1F5EDC" />
            <KpiCard title={T('totalCols')} value={dataProfile?.colCount || '—'} icon={Layers} klass="kpi-purple" color="#8b5cf6" />
            <KpiCard title={T('numCols')} value={dataProfile?.numericColCount || '—'} icon={Hash} klass="kpi-cyan" color="#06b6d4" />
            <KpiCard title={T('catCols')} value={dataProfile?.categoricalColCount || '—'} icon={Type} klass="kpi-amber" color="#f59e0b" />
            <KpiCard title={T('dataHealth')} value={`${dataProfile?.healthScore || '—'}%`} icon={Activity} klass={Number(dataProfile?.healthScore) > 90 ? 'kpi-green' : 'kpi-amber'} color={Number(dataProfile?.healthScore) > 90 ? '#10b981' : '#f59e0b'} />
            <KpiCard title={T('missingVals')} value={dataProfile?.totalMissing || '0'} icon={AlertTriangle} klass={dataProfile?.totalMissing > 0 ? 'kpi-red' : 'kpi-green'} color={dataProfile?.totalMissing > 0 ? '#ef4444' : '#10b981'} />
          </div>
        </div>

        {/* Visuals Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{T('autoVisuals')}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5"><span className="gradient-text">{autoVisuals.length}</span> {T('visSub')}</p>
          </div>
          <div className="flex items-center gap-2">
            {appMode && <span className={appMode === 'business' ? 'mode-badge-biz' : 'mode-badge-dev'}>{appMode}</span>}
            <button onClick={handleExportClean} className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs"><Download size={12} />{T('export')}</button>
          </div>
        </div>

        {/* Visuals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="anim-spin text-blue-500" /></div>
        ) : autoVisuals.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {autoVisuals.map(v => <VisualCard key={v.id} visual={v} />)}
          </div>
        ) : (
          <EmptyState icon={BarChart2} title="No visuals yet" desc="Upload a dataset to auto-generate charts" />
        )}

        {/* Data preview table */}
        {dataRows.length > 0 && (
          <div className="mt-6 glass-card overflow-hidden">
            <div className="chart-header px-5 py-3 flex items-center justify-between">
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Data Preview — First 10 Rows</p>
              <span className="text-[10px] text-slate-400">{fileName}</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {headers.slice(0, 10).map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {schema[h]?.type === 'Numeric' ? <Hash size={10} className="text-blue-400" /> : <Type size={10} className="text-purple-400" />}
                          {h.slice(0, 14)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      {headers.slice(0, 10).map(h => (
                        <td key={h} className="px-4 py-2.5 text-slate-600 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                          {row[h] === '' || row[h] === null || row[h] === undefined
                            ? <span className="text-red-400 font-semibold italic text-[10px]">missing</span>
                            : String(row[h]).slice(0, 20)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- DA DEVELOPER PAGE ---
  const renderDeveloper = () => {
    const allDone = Object.values(pipeStatus).length === 5 && Object.values(pipeStatus).every(s => s === 'done');
    return (
      <div className="p-6 max-w-4xl mx-auto overflow-y-auto h-full custom-scrollbar">
        <div className="mb-6 anim-fade">
          <h2 className="text-2xl font-black gradient-text">{T('pipelineTitle')}</h2>
          <p className="text-sm text-slate-500 mt-1">{T('pipelineSub')}</p>
        </div>

        {/* Pipeline Mode Toggle */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`px-3 py-2 rounded-xl cursor-pointer ${pipelineMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`} onClick={() => setPipelineMode('auto')}>Auto</div>
          <div className={`px-3 py-2 rounded-xl cursor-pointer ${pipelineMode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`} onClick={() => setPipelineMode('manual')}>Manual</div>
          <div className="text-sm text-slate-500 ml-3">{pipelineMode === 'auto' ? 'Run full pipeline automatically (fast).' : 'Run steps manually with guide and review outputs.'}</div>
        </div>

        {!dataRows.length ? (
          <EmptyState icon={Cpu} title={T('noDataUpload')} desc={T('noDataMsg')}
            action={<button onClick={() => fileInputRef.current?.click()} className="btn-primary px-5 py-2.5 flex items-center gap-2"><Upload size={14} />{T('uploadCta')}</button>}
          />
        ) : (
          <>
            {/* Data overview */}
            <div className="glass-card p-5 mb-5 anim-fade">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FileText size={18} className="text-blue-600" /></div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{fileName}</p>
                    <p className="text-xs text-slate-400">{dataRows.length.toLocaleString()} rows · {headers.length} columns · Health: <span className={Number(dataProfile?.healthScore) > 90 ? 'text-emerald-600' : 'text-amber-600'}>{dataProfile?.healthScore}%</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {allDone && (
                    <button onClick={handleExportClean} className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs">
                      <Download size={12} />{T('dlClean')}
                    </button>
                  )}
                  <button onClick={handleRunPipeline} disabled={pipeRunning}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs disabled:opacity-60">
                    {pipeRunning ? <><Loader2 size={13} className="anim-spin" />Running...</> : <><Play size={13} />{T('runPipeline')}</>}
                  </button>
                </div>
              </div>
            </div>

                {/* Missing Values Controls */}
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Missing Values — Impute</p>
                    <div className="text-xs text-slate-400">Choose strategy per column</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-3 py-2 text-left font-black text-slate-500">Column</th>
                          <th className="px-3 py-2 text-left font-black text-slate-500">Type</th>
                          <th className="px-3 py-2 text-left font-black text-slate-500">Missing</th>
                          <th className="px-3 py-2 text-left font-black text-slate-500">Strategy</th>
                          <th className="px-3 py-2 text-left font-black text-slate-500">Constant</th>
                          <th className="px-3 py-2 text-left font-black text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headers.map(h=> (
                          <tr key={h} className="border-b border-slate-50">
                            <td className="px-3 py-2 text-slate-700 font-semibold">{h}</td>
                            <td className="px-3 py-2 text-slate-500">{schema[h]?.type}</td>
                            <td className="px-3 py-2 text-red-500 font-bold">{schema[h]?.missingCount||0}</td>
                            <td className="px-3 py-2">
                              <select className="glass-input text-xs" value={imputeStrategy[h]||''} onChange={e=>setImputeStrategy(s=>({...s,[h]:e.target.value}))}>
                                <option value="">auto</option>
                                <option value="median">Median</option>
                                <option value="mean">Mean</option>
                                <option value="min">Min</option>
                                <option value="max">Max</option>
                                <option value="mode">Mode</option>
                                <option value="constant">Constant</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input className="glass-input text-xs" placeholder="value" value={imputeConstant[h]||''} onChange={e=>setImputeConstant(s=>({...s,[h]:e.target.value}))} />
                            </td>
                            <td className="px-3 py-2">
                              <button onClick={()=>handleApplyImpute(h)} className="btn-ghost px-3 py-1 text-xs">Apply</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button onClick={handleApplyImputeAll} className="btn-primary px-4 py-2 text-xs">Apply To All</button>
                  </div>
                </div>

                {/* Pipeline Steps */}
            <div className="space-y-3 mb-6">
              {['step1', 'step2', 'step3', 'step4', 'step5'].map(k => (
                <StepCard key={k} stepKey={k} statusMap={pipeStatus} stepDefs={stepDefs} T={T} manualMode={pipelineMode === 'manual'} onRun={runStep} />
              ))}
            </div>

            {/* Results after pipeline */}
            {allDone && (
              <div className="space-y-4 anim-fade-slide">
                {/* Before / After */}
                <div className="glass-card p-5">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Cleaning Results</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-2">{T('cleanBefore')}</p>
                      <p className="text-2xl font-black text-slate-800">{dataProfile?.totalMissing}</p>
                      <p className="text-xs text-slate-500">missing values</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-2">{T('cleanAfter')}</p>
                      <p className="text-2xl font-black text-slate-800">0</p>
                      <p className="text-xs text-slate-500">missing values</p>
                    </div>
                  </div>
                </div>

                {/* New features */}
                {engineeredData?.newFeatures?.length > 0 && (
                  <div className="glass-card p-5">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{T('featNew')}</p>
                    <div className="flex flex-wrap gap-2">
                      {engineeredData.newFeatures.map(f => (
                        <span key={f} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model suggestions */}
                <div className="glass-card p-5">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">AI Model Suggestions</p>
                  <div className="space-y-3">
                    {dataProfile?.catCols.some(c => schema[c]?.uniqueCount === 2) && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center text-xs font-black text-blue-800">CL</div>
                        <div><p className="font-bold text-sm text-slate-800">Classification</p><p className="text-xs text-slate-500">Detected binary target column. Try: Logistic Regression, Random Forest, XGBoost, SVM</p></div>
                      </div>
                    )}
                    {dataProfile?.numericColCount >= 2 && (
                      <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-xs font-black text-emerald-800">RG</div>
                        <div><p className="font-bold text-sm text-slate-800">Regression</p><p className="text-xs text-slate-500">Multiple numeric columns enable prediction. Try: Linear Regression, Ridge, Gradient Boosting, Neural Net</p></div>
                      </div>
                    )}
                    {dataProfile?.numericColCount >= 3 && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-xs font-black text-purple-800">CL</div>
                        <div><p className="font-bold text-sm text-slate-800">Clustering</p><p className="text-xs text-slate-500">Discover natural groups in data. Try: K-Means, DBSCAN, Hierarchical Clustering, GMM</p></div>
                      </div>
                    )}
                    {headers.some(h => schema[h]?.isDate) && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                        <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center text-xs font-black text-amber-800">TS</div>
                        <div><p className="font-bold text-sm text-slate-800">Time Series Forecasting</p><p className="text-xs text-slate-500">Date column detected. Try: ARIMA, LSTM, Prophet, Transformer-based models</p></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top 3 performers (e.g., students) */}
                {dataProfile?.numCols && dataProfile.numCols.length > 0 && (
                  <div className="glass-card p-5">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Top 3 — {dataProfile.numCols[0]}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(() => {
                        const primary = dataProfile.numCols[0];
                        const labelCol = dataProfile.catCols && dataProfile.catCols[0] ? dataProfile.catCols[0] : headers[0];
                        const sorted = [...(cleanedRows.length ? cleanedRows : dataRows)].sort((a, b) => (Number(b[primary]) || 0) - (Number(a[primary]) || 0));
                        const top = sorted.slice(0, 3);
                        return top.map((r, i) => (
                          <div key={i} className="p-3 bg-white rounded-lg shadow-sm">
                            <p className="text-xs text-slate-400">#{i + 1}</p>
                            <p className="font-bold text-lg text-slate-800 mt-1">{String(r[labelCol] || r[primary] || 'Record').slice(0, 24)}</p>
                            <p className="text-sm text-slate-600 mt-1">{primary}: <span className="font-black">{r[primary]}</span></p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Schema Table */}
            <div className="glass-card overflow-hidden mt-4">
              <div className="chart-header px-5 py-3">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Column Schema Analysis</p>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Column', 'Type', 'Unique', 'Missing', 'Missing %', 'Sample Values'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((h, i) => (
                      <tr key={h} className={`border-b border-slate-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{h}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${schema[h]?.type === 'Numeric' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{schema[h]?.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{schema[h]?.uniqueCount}</td>
                        <td className="px-4 py-2.5">
                          {schema[h]?.missingCount > 0
                            ? <span className="text-red-500 font-bold">{schema[h]?.missingCount}</span>
                            : <span className="text-emerald-500">0</span>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{schema[h]?.missingPct}%</td>
                        <td className="px-4 py-2.5 text-slate-400 max-w-[160px] truncate">{schema[h]?.sampleValues?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // --- AI WORKSPACE (Chat) PAGE ---
  const renderChat = () => (
    <div className="flex h-full overflow-hidden">
      {/* Schema sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-slate-100 p-4 overflow-y-auto custom-scrollbar hidden lg:block">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dataset Schema</p>
        {!dataRows.length ? (
          <p className="text-xs text-slate-400 italic">No dataset loaded</p>
        ) : (
          <div className="space-y-1.5">
            {headers.map(h => (
              <div key={h} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                {schema[h]?.type === 'Numeric' ? <Hash size={10} className="text-blue-400 flex-shrink-0" /> : <Type size={10} className="text-purple-400 flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-700 truncate">{h}</p>
                  {schema[h]?.missingCount > 0 && <p className="text-[9px] text-red-400">{schema[h].missingCount} missing</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 anim-fade-slide ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-blue-600' : 'bg-slate-200'}`}>
                {msg.role === 'bot' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600" />}
              </div>
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'bot' ? 'bg-white border border-slate-100 shadow-sm text-slate-700' : 'bg-blue-600 text-white'}`}>
                {msg.role === 'bot'
                  ? <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"><ChatMessage msg={msg} /></div>
                  : msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-3 anim-fade">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Quick questions */}
        <div className="px-5 pb-2 flex gap-2 flex-wrap">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => handleSendMessage(null, q, false)} className="text-[10px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap">{q}</button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={e => handleSendMessage(e, null, false)} className="p-4 border-t border-slate-100 flex gap-3">
          <input
            className="glass-input flex-1"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={T('chatPlaceholder')}
            disabled={chatLoading}
          />
          <button type="submit" disabled={chatLoading || !inputMessage.trim()} className="btn-primary px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
            {chatLoading ? <Loader2 size={14} className="anim-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">{T('send')}</span>
          </button>
        </form>
      </div>
    </div>
  );

  // --- TUTORIAL PAGE ---
  const renderTutorial = () => {
    const slides = TUTORIAL[lang] || TUTORIAL.en;
    const cur = slides[tutSlide];
    return (
      <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-black gradient-text mb-2">{T('tutTitle')}</h2>
        <p className="text-sm text-slate-500 mb-6">Interactive guide to get started quickly</p>
        {/* Slide nav dots */}
        <div className="flex items-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setTutSlide(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{ background: i === tutSlide ? '#1F5EDC' : '#e2e8f0', width: i === tutSlide ? '24px' : '8px' }}
            />
          ))}
        </div>
        {/* Current slide */}
        <div key={tutSlide} className="glass-card p-8 anim-scale mb-5">
          <div className="text-5xl mb-4">{cur.icon}</div>
          <h3 className="text-xl font-black text-slate-800 mb-1">{cur.title}</h3>
          <p className="text-sm text-blue-600 font-semibold mb-4">{cur.sub}</p>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-xl p-5">{cur.body}</div>
        </div>
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setTutSlide(s => Math.max(s - 1, 0))} disabled={tutSlide === 0}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 disabled:opacity-40"><ChevronLeft size={14} />{T('prev')}</button>
          <span className="text-xs text-slate-400 font-semibold">{tutSlide + 1} / {slides.length}</span>
          <button onClick={() => setTutSlide(s => Math.min(s + 1, slides.length - 1))} disabled={tutSlide === slides.length - 1}
            className="btn-primary px-4 py-2.5 flex items-center gap-2 disabled:opacity-50">{T('next')}<ChevronRight size={14} /></button>
        </div>
        {/* All slides overview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slides.map((s, i) => (
            <button key={i} onClick={() => setTutSlide(i)}
              className={`glass-card p-4 text-left transition-all flex gap-3 items-start ${i === tutSlide ? 'border-blue-300 bg-blue-50/50' : ''}`}>
              <span className="text-2xl">{s.icon}</span>
              <div><p className="font-bold text-sm text-slate-800">{s.title}</p><p className="text-xs text-slate-400">{s.sub}</p></div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // --- SETTINGS PAGE ---
  const renderSettings = () => (
    <div className="p-8 max-w-2xl mx-auto overflow-y-auto h-full custom-scrollbar">
      <h2 className="text-2xl font-black gradient-text mb-2">{T('settings')}</h2>
      <p className="text-sm text-slate-500 mb-8">Configure your Mr K AI Eco agent</p>

      {/* Authentication (Supabase) */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Cpu size={18} className="text-blue-600" /></div>
          <div>
            <p className="font-black text-sm text-slate-800">Authentication</p>
            <p className="text-xs text-slate-400">Sign in with Supabase to securely enable AI features and store keys server-side.</p>
          </div>
        </div>
        {!groqKey && (
          <div className="mb-3 text-sm text-slate-500">AI responses require authentication. Use the Supabase login flow to enable AI for your account.</div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setMessages(prev => [...prev, { role: 'bot', text: 'Opening Supabase sign-in (placeholder). Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real login.' }])}
            className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"><User size={13} />Sign in with Supabase</button>
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Globe size={18} className="text-purple-600" /></div>
          <p className="font-black text-sm text-slate-800">{T('langToggle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${lang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}>🇬🇧 English</button>
          <button onClick={() => setLang('ta')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${lang === 'ta' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}>🇮🇳 தமிழ்</button>
        </div>
      </div>

      {/* Mode */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Settings size={18} className="text-amber-600" /></div>
          <p className="font-black text-sm text-slate-800">Application Mode</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAppMode('business')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${appMode === 'business' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'}`}>🏢 Business Mode</button>
          <button onClick={() => setAppMode('developer')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${appMode === 'developer' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-200'}`}>🔬 DA Developer</button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Main Layout
  // ============================================================
  // ---- Profile Page ----
  const renderProfile = () => {
    const joinDate = supaUser?.created_at ? new Date(supaUser.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'Unknown';
    const email = supaUser?.email || '';
    const initials = email ? email.slice(0,2).toUpperCase() : 'VO';
    const userName = supaUser?.user_metadata?.full_name || email.split('@')[0] || 'User';
    const totalRows = projects.reduce((s, p) => s + (p.rowCount || 0), 0);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    return (
      <div className="p-8 max-w-2xl mx-auto overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div className="mb-8 anim-fade">
          <h2 className="text-2xl font-black gradient-text mb-1">Profile</h2>
          <p className="text-sm text-slate-500">Manage your account and preferences</p>
        </div>

        {/* Auth gate — not signed in */}
        {!supaUser ? (
          <div className="glass-card p-10 text-center anim-scale">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <UserCircle2 size={28} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Sign in to view your profile</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Create an account or sign in to access cloud sync, project history, and your profile dashboard.</p>
            <button onClick={() => { setAuthModalOpen(true); setAuthTab('signin'); setAuthError(''); setAuthSuccess(''); }}
              className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto">
              <LogIn size={15} /> Sign In to View Once
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Profile Card */}
            <div className="glass-card p-6 anim-fade">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-black shadow-lg"
                  style={{background:'linear-gradient(135deg,#0A2A66,#1F5EDC)'}}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-slate-800 truncate">{userName}</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider flex-shrink-0">Pro</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mb-3">{email}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      Cloud Sync Active
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Shield size={10} className="text-blue-400" />
                      Row-Level Security
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar size={10} className="text-slate-400" />
                      Joined {joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: FolderOpen, label: 'Projects', value: projects.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Database, label: 'Rows Analyzed', value: totalRows.toLocaleString(), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: MessageSquare, label: 'AI Sessions', value: messages.filter(m => m.role === 'user').length, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="glass-card p-5 text-center anim-fade">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={18} className={color} />
                  </div>
                  <p className="text-2xl font-black text-slate-800">{value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Account details */}
            <div className="glass-card p-6">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Account Information</p>
              <div className="space-y-3">
                {[
                  { label: 'Email', value: email, icon: User },
                  { label: 'User ID', value: supaUser.id?.slice(0, 18) + '...', icon: Shield },
                  { label: 'Member Since', value: joinDate, icon: Calendar },
                  { label: 'Plan', value: 'Free Tier (Cloud Sync Enabled)', icon: Cloud },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <Icon size={13} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{label}</span>
                    </div>
                    <span className="text-xs text-slate-700 font-semibold truncate max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-card p-6">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Preferences</p>
              <div className="space-y-3">
                {/* Language */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Language</p>
                  <div className="flex gap-2">
                    <button onClick={() => setLang('en')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${lang === 'en' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}>🇬🇧 English</button>
                    <button onClick={() => setLang('ta')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${lang === 'ta' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}>🇮🇳 தமிழ்</button>
                  </div>
                </div>
                {/* Mode */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Application Mode</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAppMode('business')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${appMode === 'business' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'}`}>🏢 Business</button>
                    <button onClick={() => setAppMode('developer')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${appMode === 'developer' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-200'}`}>🔬 DA Developer</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects list */}
            {projects.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Recent Projects ({projects.length})</p>
                <div className="space-y-2">
                  {projects.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => { setActiveProjectId(p.id); setCurrentPage('dashboard'); }}>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Database size={13} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.rowCount?.toLocaleString()} rows · {p.type}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">{new Date(p.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="glass-card p-6 border border-red-100">
              <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">⚠ Danger Zone</p>
              {!showDeleteConfirm ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleSignOut}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <LogOut size={13} /> Sign Out
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    <Trash2 size={13} /> Delete Account
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-700 mb-1">Are you absolutely sure?</p>
                  <p className="text-xs text-red-500 mb-4">This will permanently delete your account and all projects. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600">Cancel</button>
                    <button onClick={handleSignOut} className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white">Yes, Delete</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  };

  const NAV_ITEMS = [
    { key: 'home', icon: Home, label: T('home') },
    { key: 'dashboard', icon: LayoutDashboard, label: T('dashboard') },
    { key: 'developer', icon: Code2, label: T('daDev') },
    { key: 'chat', icon: MessageSquare, label: T('aiWorkspace') },
    { key: 'tutorial', icon: BookOpen, label: T('tutorial') },
    { key: 'profile', icon: UserCircle2, label: 'Profile' },
    { key: 'settings', icon: Settings, label: T('settings') }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

      {/* ========== SIDEBAR ========== */}
      <aside className="glass-sidebar w-60 flex flex-col flex-shrink-0 z-30">
        {/* Brand */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/20" style={{background:'rgba(255,255,255,0.12)',boxShadow:'0 2px 12px rgba(31,94,220,0.5)'}}>
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span style="font-size:18px;line-height:1">🔍</span>'; }}
              />
            </div>
            <div>
              <p className="font-black text-sm text-white tracking-tight">View Once</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">Complete Clarity</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setCurrentPage(key)} className={`nav-item ${currentPage === key ? 'nav-active' : ''}`}>
              <Icon size={15} />{label}
            </button>
          ))}

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <div className="pt-4 pb-1.5 px-1">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">{T('myProjects')}</p>
              </div>
              {projects.slice(0, 5).map(p => (
                <button key={p.id} onClick={() => { setActiveProjectId(p.id); setCurrentPage('dashboard'); }}
                  className={`nav-item text-left ${p.id === activeProjectId ? 'text-blue-300' : ''}`}>
                  <FolderOpen size={13} className="flex-shrink-0" />
                  <span className="truncate text-[11px]">{p.name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Bottom: user info + mode badge */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {supaUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={10} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/70 font-bold truncate">{supaUser.email?.split('@')[0]}</p>
                  <p className="text-[9px] text-emerald-400 font-semibold">● Cloud Sync On</p>
                </div>
              </div>
              <button onClick={handleSignOut} title="Sign Out" className="w-6 h-6 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors flex-shrink-0">
                <LogOut size={10} className="text-white/40 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthModalOpen(true); setAuthTab('signin'); setAuthError(''); setAuthSuccess(''); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-500/25 transition-all text-left"
              style={{background:'rgba(31,94,220,0.18)'}}
            >
              <LogIn size={12} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-blue-300 font-bold">Sign in to sync</p>
                <p className="text-[9px] text-white/30">Save projects to cloud</p>
              </div>
            </button>
          )}
          {appMode
            ? <span className={appMode === 'business' ? 'mode-badge-biz' : 'mode-badge-dev'}>{appMode === 'business' ? 'Business Mode' : 'DA Developer'}</span>
            : <span className="text-xs text-white/25 font-semibold">No mode selected</span>}
          <p className="text-[9px] text-white/25">Mr K AI Eco System</p>
        </div>
      </aside>

      {/* ========== MAIN AREA ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="glass-topbar flex items-center justify-between px-6 py-3 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-black text-sm text-slate-800">
                {NAV_ITEMS.find(n => n.key === currentPage)?.label}
              </p>
              {fileName && <p className="text-[10px] text-slate-400 font-semibold">{fileName} · {dataRows.length.toLocaleString()} rows</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* DB Sync indicator */}
            {dbSyncing && <div className="flex items-center gap-1 text-[10px] text-blue-500"><Loader2 size={10} className="anim-spin" /><span>Syncing…</span></div>}
            {/* Language toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full">
              <span onClick={() => setLang('en')} className={`lang-pill ${lang === 'en' ? 'lang-active' : ''}`}>EN</span>
              <span onClick={() => setLang('ta')} className={`lang-pill ${lang === 'ta' ? 'lang-active' : ''}`}>தமிழ்</span>
            </div>
            {/* Tutorial button */}
            <button onClick={() => setIsTutOpen(true)} className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs">
              <BookOpen size={13} />{T('howToUse')}
            </button>
            {/* Upload */}
            <button
              onClick={() => {
                if (!supaUser) {
                  setAuthModalOpen(true);
                  setAuthTab('signin');
                  setAuthError('');
                  setAuthSuccess('');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-xs relative"
            >
              {!supaUser && <Lock size={10} className="text-white/70" />}
              <Upload size={13} />{T('uploadCta')}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 size={36} className="anim-spin text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-semibold">{T('loading')}</p>
              </div>
            </div>
          ) : (
            <>
              {currentPage === 'home' && renderHome()}
              {currentPage === 'dashboard' && renderDashboard()}
              {currentPage === 'developer' && renderDeveloper()}
              {currentPage === 'chat' && renderChat()}
              {currentPage === 'tutorial' && renderTutorial()}
              {currentPage === 'profile' && renderProfile()}
              {currentPage === 'settings' && renderSettings()}
            </>
          )}
        </main>
      </div>

      {/* ========== FLOATING MINI CHAT ========== */}
      {currentPage !== 'chat' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {isMiniOpen && (
            <div className="glass-chat-win w-80 flex flex-col anim-scale" style={{ height: 420 }}>
              {/* Mini chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/bot_icon.png" alt="Bot" className="w-7 h-7 rounded-xl object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  <div>
                    <p className="font-black text-xs text-slate-800">Mr K AI Eco</p>
                    <p className="text-[9px] text-emerald-500 font-semibold">● Active</p>
                  </div>
                </div>
                <button onClick={() => setIsMiniOpen(false)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><X size={11} /></button>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {messages.slice(-8).map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      {msg.role === 'bot' ? <Bot size={10} className="text-white" /> : <User size={10} className="text-slate-600" />}
                    </div>
                    <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'bot' ? 'bg-slate-50 text-slate-700 border border-slate-100' : 'bg-blue-600 text-white'}`}>
                      {msg.role === 'bot'
                        ? <div className="prose prose-xs max-w-none"><ChatMessage msg={msg} /></div>
                        : msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center"><Bot size={10} className="text-white" /></div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-1">
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={miniMsgEndRef} />
              </div>
              {/* Input */}
              <form onSubmit={e => handleSendMessage(e, null, true)} className="p-3 border-t border-slate-100 flex gap-2">
                <input className="glass-input flex-1 text-xs py-2" value={miniInput} onChange={e => setMiniInput(e.target.value)} placeholder={T('chatPlaceholder')} disabled={chatLoading} />
                <button type="submit" disabled={chatLoading || !miniInput.trim()} className="btn-primary w-9 h-9 flex items-center justify-center flex-shrink-0 disabled:opacity-50 rounded-xl">
                  {chatLoading ? <Loader2 size={12} className="anim-spin" /> : <Send size={12} />}
                </button>
              </form>
            </div>
          )}
          {/* Toggle button */}
          <button onClick={() => setIsMiniOpen(s => !s)}
            className="w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: 'linear-gradient(135deg,#0A2A66,#1F5EDC)', boxShadow: '0 8px 32px rgba(31,94,220,0.45)' }}>
            {isMiniOpen
              ? <X size={20} className="text-white" />
              : <img src="/bot_icon.png" alt="Chat" className="w-8 h-8 object-cover rounded-xl" onError={e => { e.target.replaceWith(Object.assign(document.createElement('span'), { innerHTML: '🤖', style: 'font-size:22px' })); }} />}
          </button>
        </div>
      )}

      {/* ========== MODALS ========== */}
      {isTutOpen && <TutorialModal lang={lang} onClose={() => setIsTutOpen(false)} />}
      {isProjModalOpen && pendingFile && (
        <ProjectModal
          lang={lang}
          onSave={handleProjectCreate}
          onClose={() => { setIsProjModalOpen(false); setPendingFile(null); }}
          fileName={pendingFile.file?.name || ''}
          previewRows={pendingRows}
        />
      )}

      {/* ========== AUTH MODAL ========== */}
      {authModalOpen && (
        <div className="modal-overlay anim-fade" onClick={e => e.target === e.currentTarget && setAuthModalOpen(false)}>
          <div className="glass-panel w-full max-w-md mx-4 anim-scale overflow-hidden">
            <div className="px-8 pt-8 flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{background:'linear-gradient(135deg,#1F5EDC,#7c3aed)'}}>
                  <Shield size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800">{authTab === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-xs text-slate-400 mt-1">{authTab === 'signin' ? 'Sign in to sync projects to the cloud' : 'Join View Once to save your analytics'}</p>
              </div>
              <button onClick={() => setAuthModalOpen(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0 mt-1"><X size={14} /></button>
            </div>
            <div className="px-8 pt-5">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button onClick={() => { setAuthTab('signin'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'signin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sign In</button>
                <button onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Create Account</button>
              </div>
            </div>
            <form onSubmit={authTab === 'signin' ? handleAuthSignIn : handleAuthSignUp} className="px-8 py-6 space-y-4">
              {authTab === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Your name" className="glass-input w-full" required />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" className="glass-input w-full" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder={authTab === 'signup' ? 'Min. 8 characters' : 'Your password'} className="glass-input w-full" required minLength={authTab === 'signup' ? 8 : undefined} />
              </div>
              {authError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{authError}</p>
                </div>
              )}
              {authSuccess && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-600">{authSuccess}</p>
                </div>
              )}
              {!SUPABASE_READY && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-bold">Supabase not configured</p>
                    <p>Add <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-amber-100 px-1 rounded">.env</code></p>
                  </div>
                </div>
              )}
              <button type="submit" disabled={authLoading || !SUPABASE_READY} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                {authLoading ? <Loader2 size={14} className="anim-spin" /> : (authTab === 'signin' ? <LogIn size={14} /> : <User size={14} />)}
                {authLoading ? 'Please wait...' : (authTab === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
            <div className="px-8 pb-6 text-center">
              <p className="text-[10px] text-slate-400"><Lock size={9} className="inline mr-1" />Secured with Row-Level Security. Only you can access your projects.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
