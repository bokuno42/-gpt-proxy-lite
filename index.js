const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 캐시 메모리 (질문 기준)
const cache = {};
const CACHE_TTL = 60 * 60 * 1000; // 1시간

app.use(express.json());

app.post("/proxy", async (req, res) => {
  try {
    const prompt = (req.body.prompt || "").trim();
    if (!prompt) return res.json({ result: "질문이 비었쏘~ 🐿❓" });

    // 캐시 확인
    const now = Date.now();
    if (cache[prompt] && (now - cache[prompt].timestamp < CACHE_TTL)) {
      return res.json({ result: cache[prompt].response });
    }

    // GPT-3.5-turbo 요청
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "넌 랑지봇이애오~ 😆 귀엽고 장난기 많은 다람쥐 캐릭터쏘!
" +
              "짧고 재치 있게 대답해줘야쎄오. 반말도 섞고 말투는 '~하케', '~쏘', '~보쥬쓰이쓰카?' 이런 느낌.
" +
              "대답은 최대한 짧고 센스있게 해쥬쓰이쓰카!"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    cache[prompt] = { response: reply, timestamp: now };

    res.json({ result: reply });

  } catch (err) {
    console.error("[PROXY ERROR]", err.message || err);
    res.status(500).json({ error: "⚠ GPT 응답 실패. 크레딧 또는 네트워크 확인해쥬쓰이쓰카!" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 절약형 랑지봇 프록시 서버 작동 중! 포트: ${PORT}`);
});
