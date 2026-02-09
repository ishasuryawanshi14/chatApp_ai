"use client";

import { useEffect, useState } from "react";
import { askGemini } from "./actions";
import { supabase } from "@/lib/supabase";

function getUserId() {
  let id = localStorage.getItem("chat_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_user_id", id);
  }
  return id;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const userId = getUserId();

    async function loadChat() {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (data) {
        const formatted = [];
        for (let i = 0; i < data.length; i += 2) {
          formatted.push({
            question: data[i]?.text,
            answer: data[i + 1]?.text,
          });
        }
        setHistory(formatted);
      }
    }

    loadChat();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const userId = getUserId();
    setLoading(true);

    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      text: input,
    });

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("role, text")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);

      console.log("messages:", messages);


    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const answer = await askGemini(contents);

    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "model",
      text: answer,
    });

    setHistory((prev) => prev.concat({ question: input, answer }));
    setInput("");
    setLoading(false);
  };
 
 return (
  <div className="app">
    <div className="chatContainer">
      <div className="topBar">
  <div className="brand">AI Assistant</div>
</div>


      <div className="messages">
        {history.map((item, i) => (
          <div key={i} className="messageBlock">
            <div className="userRow">
              <div className="avatar userAvatar">U</div>
              <div className="bubble userBubble">{item.question}</div>
            </div>

            <div className="aiRow">
              <div className="avatar aiAvatar">AI</div>
              <div className="bubble aiBubble">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="inputSection">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Generating..." : "Send"}
        </button>
      </div>
    </div>

    <style jsx>{`
      .app {
        height: 100vh;
        background: #0f172a;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Inter, sans-serif;
      }

      .chatContainer {
        width: 100%;
        max-width: 900px;
        height: 90vh;
        background: #111827;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      }

      .topBar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        border-bottom: 1px solid #1f2937;
      }

      .brand {
        font-weight: 600;
        color: white;
        font-size: 16px;
      }

      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .messageBlock {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .userRow,
      .aiRow {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }

      .userAvatar {
        background: #374151;
        color: white;
      }

      .aiAvatar {
        background: #2563eb;
        color: white;
      }

      .bubble {
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.6;
        max-width: 70%;
      }

      .userBubble {
        background: #1f2937;
        color: #f3f4f6;
      }

      .aiBubble {
        background: #1e293b;
        color: #e5e7eb;
        border: 1px solid #1f2937;
      }

      .inputSection {
        padding: 18px 24px;
        border-top: 1px solid #1f2937;
        display: flex;
        gap: 12px;
      }

      .inputSection input {
        flex: 1;
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 10px;
        padding: 12px 14px;
        color: white;
        font-size: 14px;
        outline: none;
      }

      .inputSection input:focus {
        border-color: #2563eb;
      }

      .inputSection button {
        background: #2563eb;
        border: none;
        padding: 12px 18px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        cursor: pointer;
      }

      .inputSection button:hover {
        background: #1d4ed8;
      }
    `}</style>
  </div>
);
}