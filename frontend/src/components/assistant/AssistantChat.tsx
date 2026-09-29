"use client";

import React, { useState, useRef, useEffect } from "react";
import { AssistantMessage } from "@/types";
import { useAnalysis } from "@/context/AnalysisContext";
import { generateAssistantResponse } from "@/lib/rag-engine";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Why are some campaigns high risk?",
  "What could explain my high CPA?",
  "Which campaigns should I investigate first?",
  "What does this anomaly mean?",
  "How can I improve conversion performance?",
  "What does CTR mean?",
];

export const AssistantChat: React.FC = () => {
  const { currentAnalysis } = useAnalysis();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      content: `Hello! I am your **Campaign Intelligence Assistant** powered by a RAG knowledge base of verified marketing heuristics and ML models.

${
  currentAnalysis
    ? `I have loaded your active dataset: **${currentAnalysis.filename}** (${currentAnalysis.summary.total_campaigns} campaigns, $${currentAnalysis.summary.total_spend.toLocaleString()} total spend, ${currentAnalysis.summary.risk_distribution["High Risk"] || 0} high-risk flags).

You can ask me questions about your specific campaign numbers, waste leakage reasons, anomaly explanations, or broader optimization strategies.`
    : `I am currently in general advisory mode. Upload or select a campaign dataset to ground explanations directly in your real measurements.`
}

Click one of the suggested prompts below or ask your own question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Simulate quick RAG retrieval and synthesis
    setTimeout(() => {
      const response = generateAssistantResponse(text, currentAnalysis);

      const assistantMsg: AssistantMessage = {
        id: `assistant_${Date.now()}`,
        sender: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ragSources: response.ragSources,
        campaignMetricsReferenced: response.campaignMetricsReferenced,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Campaign Intelligence Assistant
            </h3>
            <p className="text-[11px] text-slate-500">
              RAG Knowledge Base & ML-grounded explanations
            </p>
          </div>
        </div>

        {/* Dataset context badge */}
        <div className="flex items-center gap-2">
          {currentAnalysis ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="font-semibold truncate max-w-[150px]">
                {currentAnalysis.filename}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No dataset loaded</span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-indigo-100 text-indigo-700 border border-indigo-200"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-800 border border-slate-200"
              }`}
            >
              {/* Content formatted with basic markdown replacement */}
              <div
                className="prose-xs space-y-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/### (.*?)\n/g, '<h4 class="font-bold text-slate-900 text-sm mt-2 mb-1">$1</h4>')
                    .replace(/#### (.*?)\n/g, '<h5 class="font-bold text-slate-800 text-xs mt-2 mb-1 uppercase tracking-wider">$1</h5>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-slate-600">$1</em>')
                    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-200/80 font-mono text-[11px] text-indigo-900">$1</code>'),
                }}
              />

              {/* RAG Knowledge sources citations */}
              {msg.ragSources && msg.ragSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-cyan-600" />
                    Retrieved Knowledge Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.ragSources.map((source, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-medium"
                        title={source.keyRule}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                        {source.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <span
                className={`text-[9px] mt-2 block ${
                  msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium">Retrieving knowledge base & grounding metrics...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts pills */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0">
          <HelpCircle className="w-3 h-3" />
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 shadow-sm transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your campaigns, metrics, or anomalies..."
          className="flex-1 px-4 py-2 text-xs md:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
