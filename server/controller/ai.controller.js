import { ApiResponse } from "../utils/ApiResponse.js";

const AiSummary = async (req, res) => {
  try {
    const { FinancialData } = req.body;
    if (!FinancialData) {
      return res.json(
        new ApiResponse(400, "Please enter your FinancialData", [])
      );
    }
    const YOUR_API_KEY = process.env.OPEN_ROUTER_API_KEY;
    const prompt = `
    You are a financial analyst AI assistant.
    
    Given the user's financial data (monthly breakdown, money in/out, and categorized expenses), do the following:
    1. Summarize the user's spending behavior in simple terms.
    2. Highlight which categories they spend the most on.
    3. Suggest 2/3 areas where the user can reduce or optimize their expenses.
    4. Comment on whether their credited income is sufficient.
    
    Here is the user's data:
    ${JSON.stringify(FinancialData, null, 2)}
    `;
    
    if (!YOUR_API_KEY) {
      const response = new ApiResponse(400, "No api key found", []);
      return res.json(response);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${YOUR_API_KEY}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/devstral-small:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const analyis = data.choices[0]?.message.content;
      const resp = new ApiResponse(200, "Response was successfull", analyis);
      return res.json(resp);
    }
  } catch (error) {
    console.log(`we got an error fetching the api ${error.message}`);
    return res.status(500).json({
      message: `catch block.Api not fetched,${error.message}`,
    });
  }
};

export { AiSummary };
