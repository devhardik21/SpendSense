document.addEventListener("DOMContentLoaded", () => {
  console.log(`Frontend-Backend handshake initiated!`);
  const FormUpload = document.getElementById("UploadForm");
  const RespDiv = document.getElementById("response");
  const FileUpload = document.getElementById("file");
  const BaseURI = "http://localhost:8000"; // Make sure your backend runs here

  
  FormUpload.addEventListener("submit", async (e) => {
    e.preventDefault(); // ✅ Prevent reload first
    console.log("debug point 2");

    const file = FileUpload.files[0];
    if (!file) {
      RespDiv.innerHTML = `<p style="color:red;">Please select a file first.</p>`;
      return;
    }

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
      console.log("debug point 9");
      console.log("Fetch successful:", data);
      console.log("debug point 10");

      RespDiv.innerHTML = `<p style="color:green;">✅ Upload successful: ${data.message}</p>`;
    } catch (error) {
      console.error("Error connecting to backend:", error);
      RespDiv.innerHTML = `<p style="color:red;">⚠️ Error connecting to backend: ${error.message}</p>`;
    }
  });
});
