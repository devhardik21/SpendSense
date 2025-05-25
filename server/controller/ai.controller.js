import { ApiResponse } from "../utils/ApiResponse.js";

const AiSummary = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
    return res.json(new ApiResponse(400, "Please enter your query", []));

    }
    const YOUR_API_KEY = process.env.OPEN_ROUTER_API_KEY;
    const prompt = `You are an finance analyst chatbot.User will give their query related to finance and if thats related to finance,answer it and if 
        its not please dont answer it.Be kind , respectful during the chat.The user query is ${query}`;

    if (!YOUR_API_KEY) {
      const response =new  ApiResponse(400, "No api key found", []);
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
        const analyis = data.choices[0]?.message.content ;
        const resp = new ApiResponse(200,'Response was successfull',analyis) ; 
      return res.json(resp);   
    
    }
  } catch (error) {
    console.log(`we got an error fetching the api ${error.message}`);
   return res.status(500).json({
     message: `catch block.Api not fetched,${error.message}`,
   });
  }
};

export {AiSummary} ;