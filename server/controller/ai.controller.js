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
    
    The user's financial data is in Indian Rupees (₹) and includes:
    - Total money spent and credited
    - Categorized breakdown of expenses
    - Monthly expense history
    
    Your task is to analyze this data and first give a heading Your Report and then return a report in two **clear sections**:
    
    ---
    
    **1. Summary (2-3 lines):**{Keep it 2/3 lines only}
    - Briefly describe the user's overall spending behavior.
    - Highlight the top 2/3 categories where they spend the most.
    - Comment on whether their credited income is sufficient to cover their expenses.
    
    ---
    
    **Spending Optimization Tips:**{give the user 5/6 points}
    - Suggest in-depth and practical ways to reduce or optimize spending.
    - Make sure the suggestions are **relevant** to the categories and patterns seen in the data.
    - Avoid generic advice — personalize the suggestions based on real values.
    
    All values are in ₹ (Indian Rupees).Dont include any other symbol than ruppee. Here is the user's financial data:
    
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
