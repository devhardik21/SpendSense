document.addEventListener("DOMContentLoaded", () => {
  console.log(`Frontend-Backend handshake initiated!`);
  const FormUpload = document.getElementById("UploadForm");
  const RespDiv = document.getElementById("response");
  const FileUpload = document.getElementById("file");
  const BaseURI = "https://spendsense-1-5wz2.onrender.com"; // Make sure your backend runs here
  const ExpCreditArea = document.getElementById("ExpCredit");
  const CatExpArea = document.getElementById("CatExp");
  const MonthExpArea = document.getElementById("MonthExp");

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
  FormUpload.addEventListener("submit", async (e) => {
    e.preventDefault(); //  Prevent reload first
    console.log("debug point 2");

    const file = FileUpload.files[0];
    if (!file) {
      RespDiv.innerHTML = `<p style="color:red;">Please select a file first.</p>`;
      return;
    }

    RespDiv.innerHTML = `
    <p style="
    color:green;
    margin:25px;
    ">Uploading your file.Processing your expenses</p>`;
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

      RespDiv.innerHTML = `
      <p style="
      color:green;
      margin:25px;
      ">Upload Successful.Here is your summary
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
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                // color: "#EAEAEA", // light grey for readability
                font: {
                  size: 14,
                  weight: "bold",
                },
                padding: 20,
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
          labels: data.data.TransactionType.label,
          datasets: [
            {
              label: "Category wise expense", // <-- FIXED
              data: data.data.TransactionType.values,
              backgroundColor: beautifulColors,
              borderColor: beautifulColors,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                // color: "#EAEAEA", // light grey for readability
                font: {
                  size: 14,
                  weight: "bold",
                },
                padding: 20,
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
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 14,
                  weight: "bold",
                },
                padding: 20,
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
});
