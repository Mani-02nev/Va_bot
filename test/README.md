# 🧪 Mr K AI Eco — Test Datasets

These 5 CSV files are designed to test all features of the **View Once | Complete Clarity** platform.
Each dataset covers a different industry domain and contains intentional **missing values** to test AI profiling accuracy.

---

## 📁 Dataset Overview

| File | Domain | Rows | Columns | Missing Values |
|------|--------|------|---------|----------------|
| `company_employees.csv` | 🏢 HR / Company | 15 | 8 | Yes (performance_score, projects_completed) |
| `product_sales.csv` | 🛒 Retail / Sales | 15 | 8 | No |
| `student_performance.csv` | 🎓 Education | 15 | 8 | Yes (science_score, study_hours) |
| `web_analytics.csv` | 🌐 Digital / Web | 15 | 7 | No |
| `patient_records.csv` | 🏥 Healthcare | 15 | 8 | Yes (visits, cholesterol) |

---

## 📄 Dataset Details

### 1. `company_employees.csv` — HR / Company Data
**Use case:** Analyzing employee performance, salary distribution, and departmental trends.

**Columns:**
- `employee_id` — Unique ID (EMP####)
- `name` — Employee name
- `department` — Engineering, Marketing, Sales, HR
- `salary` — Annual salary (USD)
- `hire_date` — Date of joining (YYYY-MM-DD)
- `projects_completed` — Number of projects (has **missing values**)
- `performance_score` — Rating out of 10 (has **missing values**)
- `office_location` — Atlanta / Chicago / New York

**Expected Visuals:** Salary by Department (Bar), Performance Score Distribution (Histogram), Projects vs Salary (Scatter), Location Map (Pie).

---

### 2. `product_sales.csv` — Retail / Product Sales
**Use case:** Revenue analysis, category performance, and regional trends.

**Columns:**
- `transaction_id` — Unique ID (TXN####)
- `product_name` — Product name
- `category` — Electronics, Furniture, Office Supplies
- `units_sold` — Quantity sold
- `unit_price` — Price per unit (USD)
- `revenue` — Total revenue (units × price)
- `transaction_date` — Date of sale
- `customer_region` — North / South / East / West

**Expected Visuals:** Revenue by Category (Bar), Units Sold Trend (Line), Revenue by Region (Pie), Price vs Revenue (Scatter).

---

### 3. `student_performance.csv` — Education / Academic
**Use case:** Identifying at-risk students, attendance correlation, and score trends.

**Columns:**
- `student_id` — Unique ID (STU####)
- `name` — Student name
- `grade_level` — 10th / 11th / 12th
- `math_score` — Score out of 100
- `science_score` — Score out of 100 (has **missing values**)
- `attendance_rate` — % attendance
- `study_hours_per_week` — Hours per week (has **missing values**)
- `passed` — Yes / No

**Expected Visuals:** Score Distribution (Histogram), Attendance vs Score (Scatter), Pass Rate by Grade (Pie), Study Hours Correlation (Bar).

---

### 4. `web_analytics.csv` — Digital Marketing / Web
**Use case:** Traffic source analysis, bounce rate optimization, device behavior.

**Columns:**
- `session_id` — Unique ID (SES####)
- `device_category` — Desktop / Mobile / Tablet
- `bounce_rate` — 0.0 – 1.0 (lower is better)
- `session_duration_sec` — Time on site in seconds
- `pageviews` — Pages viewed per session
- `visitor_type` — New / Returning
- `traffic_source` — Organic Search, Paid Social, Direct, Referral, etc.

**Expected Visuals:** Device Split (Pie), Bounce Rate by Device (Bar), Session Duration Trend (Line), Traffic Source (Doughnut).

---

### 5. `patient_records.csv` — Healthcare / Medical
**Use case:** Patient risk scoring, admission analysis, departmental load.

**Columns:**
- `patient_id` — Unique ID (PAT####)
- `age` — Patient age
- `gender` — Male / Female
- `blood_pressure` — Systolic reading
- `cholesterol` — mg/dL level (has **missing values**)
- `visits_last_year` — Hospital visit count (has **missing values**)
- `admitted_status` — Admitted / Discharged
- `department` — Cardiology, Geriatrics, Emergency, etc.

**Expected Visuals:** Age Distribution (Histogram), Cholesterol by Dept (Box Plot), Admission Status (Pie), BP vs Age (Scatter).

---

## 🚀 How to Use

1. Start the dev server: `cd frontend && npm run dev`
2. Open the app in your browser
3. Click **"Upload Dataset"** on the Home or Dashboard page
4. Select any CSV from this `test/` folder
5. The AI will auto-detect schema and generate all visuals instantly
6. Use the **Mini Chatbot** or **AI Workspace** to ask questions like:
   - *"What are the missing values in this dataset?"*
   - *"Which department has the highest average salary?"*
   - *"Summarize the key trends in this data."*

---

## 💡 Tips for Testing

- Upload **company_employees.csv** to test missing value detection
- Upload **web_analytics.csv** to test categorical grouping visuals
- Ask the chatbot: *"How is this data related to AI/ML?"* — it will explain
- Try exporting charts after upload to test the CSV export feature

---

*Powered by **Mr K AI Eco System** — View Once | Complete Clarity*
