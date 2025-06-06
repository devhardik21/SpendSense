# 💸 SpendSense — Smart Expense Tracker with AI-Powered Insights

**SpendSense** is an intelligent personal finance tool that transforms your bank statements into clear, actionable insights. Just upload a **PDF or CSV**, and SpendSense will:

-  **Parse your data**
-  **Categorize transactions**
-  **Detect subscriptions**
-  **Generate AI-powered summaries**

All powered by **Mistral LLMs via OpenRouter**, and built for both clarity and simplicity.

---

##  Features

-  **Multi-format Support:** Upload your **bank statements** in PDF or CSV format  
-  **Accurate Parsing:**  
  - **PDFs parsed with** `pdf.js-extract`  
  - **CSVs handled by** `csv-parse`  
-  **AI Insights:**  
  Summarized spending behavior using **Mistral** models via **OpenRouter API**  
-  **Category-wise Expense Breakdown:**  
  Food, Transport, Rent, Shopping, Subscriptions, etc.  
-  **Subscription Detection:** Automatically flags recurring charges  
-  **Interactive Visuals:** Clean dashboard with graphs using **Chart.js**

---

##  Tech Stack

**Frontend:**  
- HTML,CSS,JS 
- Chart.js  

**Backend:**  
- Node.js  
- Express.js  
- Multer  
- pdf.js-extract  
- csv-parse 

**Database:**  
- MongoDB  

**AI Layer:**  
- Mistral LLMs via OpenRouter

---
