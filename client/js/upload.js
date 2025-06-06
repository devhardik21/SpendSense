// upload.js
document.addEventListener("DOMContentLoaded", () => {
  console.log(`Frontend-Backend handshake initiated!`);
  const FormUpload = document.getElementById("UploadForm");
  const RespDiv = document.getElementById("response");
  const FileUpload = document.getElementById("file");
  const BaseURI = "https://spendsense-1-5wz2.onrender.com"; 
  // const BaseURI = "http://localhost:8000"; 
  const ExpCreditArea = document.getElementById("ExpCredit");
  const CatExpArea = document.getElementById("CatExp");
  const MonthExpArea = document.getElementById("MonthExp");
  const GetInsightsBtn = document.getElementById("ai-btn");
  const AiSummarydiv = document.querySelector(".ai-generated-summary");

  let FinancialData;
  const bgColors = ["#1F2937", "#F59E0B"]; // Gunmetal + Amber
  const beautifulColors = [
    "rgba(52, 58, 64, 0.9)", // dark gray
    "rgba(108, 117, 125, 0.9)", // medium gray
    "rgba(255, 99, 132, 0.8)", // muted red
    "rgba(54, 162, 235, 0.8)", // muted blue
    "rgba(255, 206, 86, 0.8)", // muted yellow
    "rgba(75, 192, 192, 0.8)", // muted teal
    "rgba(153, 102, 255, 0.8)", // muted purple
    "rgba(255, 159, 64, 0.8)", // muted orange
    "rgba(83, 102, 255, 0.8)", // indigo
  ];

  const loadingStyles = `
<style>
  .upload-loader {
    text-align: center;
    padding: 20px;
  }
  .upload-loader__text {
    color: #2a5298;
    font-size: 1.1rem;
    margin-bottom: 15px;
    font-weight: 500;
  }
  .upload-loader__dots {
    display: inline-block;
  }
  .upload-loader__dots::after {
    content: '';
    animation: dots 1.4s linear infinite;
  }
  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
  .upload-loader__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2a5298;
    border-radius: 50%;
    margin: 10px auto;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
`;
  FormUpload.addEventListener("submit", async (e) => {
    e.preventDefault(); //  Prevent reload first
    console.log("debug point 2");

    const file = FileUpload.files[0];
    if (!file) {
      RespDiv.innerHTML = `<p style="color:red;">Please select a file first.</p>`;
      return;
    }

    // Replace the next RespDiv.innerHTML with this:
    RespDiv.innerHTML = `
      ${loadingStyles}
      <div class="upload-loader">
        <div class="upload-loader__text">
          Uploading your file<span class="upload-loader__dots"></span>
        </div>
        <div class="upload-loader__spinner"></div>
        <div style="color: #666; font-size: 0.9rem; margin-top: 10px;">
          Processing your expenses
        </div>
      </div>
    `;
    const FileData = new FormData();
    FileData.append("statement", file);
    console.log("debug point 4");

    try {
      console.log("debug point 5");

      const response = await fetch(`${BaseURI}/api/upload`, {
        method: "POST",
        body: FileData,
      });

      console.log("debug point 6");

      if (!response.ok) {
        console.log("debug point 7");

        let errMessage = "Unknown error";
        try {
          const errJson = await response.json();
          errMessage = errJson.error || JSON.stringify(errJson);
        } catch (jsonErr) {
          const errText = await response.text();
          errMessage = errText;
        }

        RespDiv.innerHTML = `<p style="color:red;">Upload failed: ${errMessage}</p>`;
        return;
      }

      console.log("debug point 8");

      const data = await response.json();

      console.log("Fetch successful:", data);

      // Remove this line as it's incomplete and causing the error:
      // UserFinancialData = data.

      // Store the financial data properly:
      FinancialData = data.data;

      // Show the graphs section
      document.querySelector(".Graphs").style.display = "flex";

      RespDiv.innerHTML = `
      <p style="
      color:green;
      margin:25px;
      ">Upload Successful. Here is your summary
      </p>`;

      const ExpCreditGraph = new Chart(ExpCreditArea, {
        type: "pie",
        data: {
          labels: data.data.MoneyBreakdown.label,
          datasets: [
            {
              label: "Expense vs Credit",
              data: data.data.MoneyBreakdown.values,
              backgroundColor: bgColors,
              borderColor: bgColors,
              borderWidth: 2,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10,
            },
          },
          plugins: {
            legend: {
              position: "bottom", // Always show legend at bottom
              labels: {
                boxWidth: window.innerWidth < 768 ? 10 : 20,
                font: {
                  size: window.innerWidth < 768 ? 10 : 14,
                },
              },
            },
            tooltip: {
              backgroundColor: "#111827", // deep navy bg
              titleColor: "#F9FAFB",
              bodyColor: "#D1D5DB",
              borderColor: "#3B82F6",
              borderWidth: 1,
            },
          },
        },
      });

      const CatExpGraph = new Chart(CatExpArea, {
        type: "bar",
        data: {
          // Filter out categories with zero values
          labels: data.data.TransactionType.label.filter(
            (label, index) => data.data.TransactionType.values[index] !== 0
          ),
          datasets: [
            {
              label: "Category wise expense",
              // Filter out zero values
              data: data.data.TransactionType.values.filter(
                (value) => value !== 0
              ),
              backgroundColor: beautifulColors.slice(
                0,
                data.data.TransactionType.values.filter((value) => value !== 0)
                  .length
              ),
              borderColor: beautifulColors.slice(
                0,
                data.data.TransactionType.values.filter((value) => value !== 0)
                  .length
              ),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10,
            },
          },
          plugins: {
            legend: {
              position: "bottom", // Always show legend at bottom
              labels: {
                boxWidth: window.innerWidth < 768 ? 10 : 20,
                font: {
                  size: window.innerWidth < 768 ? 10 : 14,
                },
              },
            },
            tooltip: {
              backgroundColor: "#111827", // deep navy bg
              titleColor: "#F9FAFB",
              bodyColor: "#D1D5DB",
              borderColor: "#3B82F6",
              borderWidth: 1,
            },
          },
        },
      });
      const MonthExpGraph = new Chart(MonthExpArea, {
        type: "line",
        data: {
          labels: data.data.MonthlyBreakdown.label,
          datasets: [
            {
              label: "Monthly Expense", // <-- FIXED
              data: data.data.MonthlyBreakdown.values,
              // backgroundColor: beautifulColors,
              // borderColor: beautifulColors,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10,
            },
          },
          plugins: {
            legend: {
              position: "bottom", // Always show legend at bottom
              labels: {
                boxWidth: window.innerWidth < 768 ? 10 : 20,
                font: {
                  size: window.innerWidth < 768 ? 10 : 14,
                },
              },
            },
            tooltip: {
              backgroundColor: "#111827", // deep navy bg
              titleColor: "#F9FAFB",
              bodyColor: "#D1D5DB",
              borderColor: "#3B82F6",
              borderWidth: 1,
            },
          },
        },
      });
      document.getElementById("ai-btn").style.display = "inline-block";
    } catch (error) {
      console.error("Error connecting to backend:", error);
      RespDiv.innerHTML = `<p style="color:red;">⚠️ Error connecting to backend: ${error.message}</p>`;
    }
  });

  GetInsightsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    GetInsightsBtn.style.display = "none";
    // Add loading animation
    AiSummarydiv.innerHTML = `
      ${loadingStyles}
      <div class="upload-loader">
        <div class="upload-loader__text">
          Generating AI Insights<span class="upload-loader__dots"></span>
        </div>
        <div class="upload-loader__spinner"></div>
        <div style="color: #666; font-size: 0.9rem; margin-top: 10px;">
          Analyzing your financial patterns
        </div>
      </div>
    `;
    AiSummarydiv.style.display = "block";

    try {
      const response = await fetch(`${BaseURI}/api/get-summary`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ FinancialData }),
      });

      // In the GetInsightsBtn click handler, modify the processMarkdown function:
      const converter = new showdown.Converter();
      const processMarkdown = (markdown) => {
        return markdown
          .replace(/\!([^!]+)\!/g, '<span class="highlight-info">$1</span>');
      };

      const data = await response.json();
      const enhancedMarkdown = processMarkdown(data.data);
      const displaySummary = converter.makeHtml(enhancedMarkdown);

      // Update summary with wrapper div for additional styling
      AiSummarydiv.innerHTML = `
        <div class="summary-content">
          ${displaySummary}
        </div>
      `;
      GetInsightsBtn.style.display = "none"; // Hide the button after successful load
    } catch (error) {
      console.log("Catch block", error.message);
      AiSummarydiv.innerHTML = `<p style="color: red; padding: 20px;">⚠️ Error generating insights: ${error.message}</p>`;
      AiSummarydiv.style.display = "block";
    }
  });
});
