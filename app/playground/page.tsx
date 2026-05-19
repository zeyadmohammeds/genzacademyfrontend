"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Play, CheckCircle, XCircle, Code, Copy, Trash,
  ArrowLeft, Cpu, Sparkle, Gear, FileCode, Keyboard, 
  ArrowFatLineRight, Eye, Eraser, Sun, Moon
} from "@phosphor-icons/react";
import Editor from "@monaco-editor/react";

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.NEXT_PUBLIC_JUDGE0_API_KEY || "";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const languages = [
  { id: 50, name: "C", extension: ".c", monaco: "c" },
  { id: 54, name: "C++", extension: ".cpp", monaco: "cpp" },
  { id: 62, name: "Java", extension: ".java", monaco: "java" },
  { id: 71, name: "Python", extension: ".py", monaco: "python" },
  { id: 63, name: "JavaScript", extension: ".js", monaco: "javascript" },
  { id: 72, name: "Ruby", extension: ".rb", monaco: "ruby" },
  { id: 73, name: "Rust", extension: ".rs", monaco: "rust" },
  { id: 74, name: "TypeScript", extension: ".ts", monaco: "typescript" },
];

const starterCode: Record<number, string> = {
  50: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  54: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  71: `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
  62: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  63: `console.log("Hello, World!");`,
  72: `puts "Hello, World!"`,
  73: `fn main() {\n    println!("Hello, World!");\n}`,
  74: `console.log("Hello, World!");`,
};

type OutputTab = "stdout" | "stderr" | "ai";

export default function PlaygroundPage() {
  const [language, setLanguage] = useState(71);
  const [code, setCode] = useState(starterCode[71]);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputTab, setOutputTab] = useState<OutputTab>("stdout");
  const [showInput, setShowInput] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hi! I am your AI code tutor. Ask me to explain the code, fix bugs, or optimize performance."
    }
  ]);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const runCodeRef = useRef<() => void>(() => {});

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, aiLoading]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const resetAll = () => {
    setCode(starterCode[language] || "");
    setStdin("");
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setOutputTab("stdout");
    setShowInput(false);
  };

  const activeLang = languages.find((l) => l.id === language);

  const runCode = async () => {
    setLoading(true);
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setOutputTab("stdout");

    if (!JUDGE0_KEY) {
      setTimeout(() => {
        setStdout("Hello, World!\n\n[Executed successfully in mock sandbox]");
        setLoading(false);
        setOutputTab("stdout");
      }, 800);
      return;
    }

    try {
      const submitRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
          stdin: stdin || ""
        })
      });

      if (!submitRes.ok) {
        setStdout("");
        setStderr("API Request failed with status code " + submitRes.status);
        setOutputTab("stderr");
        return;
      }

      const result = await submitRes.json();
      setStdout(result.stdout || "");
      setStderr(result.stderr || result.compile_output || "");

      if (result.stderr || result.compile_output) {
        setOutputTab("stderr");
      } else {
        setOutputTab("stdout");
      }
    } catch {
      setStderr("Execution failed — check connection state.");
      setOutputTab("stderr");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCodeRef.current = runCode;
  });

  const askGemini = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    setChatHistory(h => [...h, { role: "user", content: prompt }]);

    const fullPrompt = `You are a helpful clean programming mentor. Explain or help with the following code in the context of the user request: \n\nLanguage: ${activeLang?.name}\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nUser request: ${prompt}`;

    if (!GEMINI_KEY) {
      setTimeout(() => {
        setChatHistory(h => [...h, { 
          role: "assistant", 
          content: "Mock AI reply: Your code looks clean! To execute this, press the run button at the top right." 
        }]);
        setAiLoading(false);
        setAiPrompt("");
      }, 800);
      return;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1024
            }
          })
        }
      );

      if (res.status === 429) {
        setChatHistory(h => [...h, { 
          role: "assistant", 
          content: "⚠️ AI Rate Limit Reached (HTTP 429).\n\nThe Gemini API is receiving too many requests. Please wait a moment before asking again, or run code tests with the compiler above!" 
        }]);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
      setChatHistory(h => [...h, { role: "assistant", content: text }]);
    } catch (err: any) {
      console.error(err);
      const isRateLimit = err?.message?.includes("429");
      const msg = isRateLimit 
        ? "⚠️ AI Rate Limit Reached (HTTP 429). The server is temporarily busy. Please wait a moment."
        : "Error accessing AI. Please try again.";
      setChatHistory(h => [...h, { role: "assistant", content: msg }]);
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  }, [code, activeLang?.name]);

  return (
    <div 
      className={`min-h-[100dvh] w-screen flex flex-col font-sans transition-colors duration-300 ${
        isLightMode ? "bg-[#f8f9fa] text-[#2d3748]" : "bg-[#0b0c10] text-[#cbd5e1]"
      }`}
    >
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* 1. MINIMAL HEADER BAR */}
      <header className={`h-14 flex items-center justify-between px-6 border-b shrink-0 z-50 transition-colors ${
        isLightMode ? "bg-white border-zinc-200" : "bg-[#0f1015] border-white/[0.06]"
      }`}>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
              isLightMode ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700" : "bg-white/5 hover:bg-white/10 border-white/[0.06] text-zinc-300"
            }`}
          >
            <ArrowLeft size={14} weight="bold" />
          </Link>
          <span className={`font-display font-bold text-sm tracking-wide ${isLightMode ? "text-zinc-950" : "text-white"}`}>
            Playground Studio
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Language selection dropdown */}
          <div className={`p-0.5 border rounded-lg ${isLightMode ? "bg-zinc-50 border-zinc-200" : "bg-white/5 border-white/[0.06]"}`}>
            <select
              value={language}
              onChange={(e) => {
                const id = Number(e.target.value);
                setLanguage(id);
                if (!code || code === starterCode[language]) setCode(starterCode[id] || "");
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer px-2.5 py-1"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id} className={isLightMode ? "bg-white text-zinc-800" : "bg-[#0f1015] text-zinc-300"}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme switcher button */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
              isLightMode ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700" : "bg-white/5 hover:bg-white/10 border-white/[0.06] text-zinc-300"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isLightMode ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff1a1a] hover:bg-[#e01616] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={12} weight="fill" />
            )}
            <span>Run Code</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE PANEL: SOURCE CODE EDITOR */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Editor Header controls */}
          <div className={`h-10 px-4 border-b flex items-center justify-between select-none ${
            isLightMode ? "bg-zinc-50 border-zinc-200" : "bg-[#0b0c10] border-white/[0.06]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">workspace{activeLang?.extension}</span>
              
              <button
                onClick={() => setShowInput(!showInput)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all border ${
                  showInput 
                    ? 'bg-[#ff1a1a]/10 border-[#ff1a1a]/30 text-[#ff1a1a]' 
                    : isLightMode 
                      ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-600' 
                      : 'border-white/[0.06] hover:bg-white/5 text-zinc-400'
                }`}
              >
                <Keyboard size={11} />
                <span>Stdin {showInput ? 'Active' : 'Define'}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => copyToClipboard(code)}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  isLightMode ? "hover:bg-zinc-200 text-zinc-600" : "hover:bg-white/5 text-zinc-400"
                }`}
                title="Copy Code"
              >
                {copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
              <button 
                onClick={resetAll}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  isLightMode ? "hover:bg-zinc-200 text-zinc-600" : "hover:bg-white/5 text-zinc-400"
                }`}
                title="Reset Starter Code"
              >
                <Eraser size={13} />
              </button>
            </div>
          </div>

          {/* STDIN input panel drawer (RENDERED AT THE TOP) */}
          {showInput && (
            <div className={`p-4 border-b flex flex-col shrink-0 ${
              isLightMode ? "bg-[#f1f3f5] border-zinc-200" : "bg-[#14151a] border-white/[0.06]"
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 block">Standard Input (Stdin)</span>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Specify compilation stdin inputs here..."
                className={`w-full h-16 border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#ff1a1a]/30 resize-none ${
                  isLightMode ? "bg-white border-zinc-200 text-zinc-800" : "bg-[#07080a] border-white/[0.06] text-zinc-300"
                }`}
                spellCheck={false}
              />
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={activeLang?.monaco || "plaintext"}
              theme={isLightMode ? "light" : "vs-dark"}
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={(editor, monaco) => {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                  runCodeRef.current?.();
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 22,
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

        </div>

        {/* RIGHT WORKSPACE PANEL: OUTPUT & AI TUTOR */}
        <div className={`w-[450px] border-l flex flex-col shrink-0 ${
          isLightMode ? "bg-white border-zinc-200" : "bg-[#0f1015] border-white/[0.06]"
        }`}>
          
          {/* Segment Selector tabs */}
          <div className={`flex border-b shrink-0 ${
            isLightMode ? "bg-zinc-50 border-zinc-200" : "bg-[#0b0c10] border-white/[0.06]"
          }`}>
            {[
              { id: "stdout" as OutputTab, label: "Console Console" },
              { id: "stderr" as OutputTab, label: "Errors Logs" },
              { id: "ai" as OutputTab, label: "AI Tutor Companion" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setOutputTab(id)}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                  outputTab === id
                    ? 'border-[#ff1a1a] text-[#ff1a1a]'
                    : isLightMode 
                      ? 'border-transparent text-zinc-500 hover:text-zinc-800' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {outputTab !== "ai" ? (
              <div className="flex-1 p-4 overflow-y-auto">
                <pre className={`whitespace-pre-wrap text-xs font-mono p-4 rounded-xl border leading-relaxed ${
                  outputTab === "stderr" 
                    ? 'text-red-400 bg-red-950/15 border-red-500/20' 
                    : isLightMode 
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-800' 
                      : 'bg-[#07080a] border-white/[0.06] text-zinc-300'
                }`}>
                  {outputTab === "stdout" ? (stdout || "Standard program console logs will appear here.") : (stderr || "No compile errors.")}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* AI Thread list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase self-start shrink-0 ${
                        msg.role === 'user'
                          ? isLightMode ? 'bg-zinc-200 text-zinc-700' : 'bg-white/10 text-zinc-300'
                          : 'bg-[#ff1a1a]/10 text-[#ff1a1a]'
                      }`}>
                        {msg.role === 'user' ? 'Me' : 'AI'}
                      </span>
                      
                      <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                        msg.role === 'user'
                          ? isLightMode ? 'bg-zinc-100 text-zinc-800' : 'bg-white/5 text-zinc-300'
                          : isLightMode ? 'bg-red-50 text-zinc-800' : 'bg-red-950/10 text-zinc-300'
                      }`}>
                        <span className="whitespace-pre-wrap select-text">{msg.content}</span>
                      </div>
                    </div>
                  ))}
                  
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-xs px-2 select-none animate-pulse">
                      <span className="w-3.5 h-3.5 border-2 border-[#ff1a1a]/30 border-t-[#ff1a1a] rounded-full animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* AI Inputs panel */}
                <div className={`p-3 border-t flex gap-2 shrink-0 ${
                  isLightMode ? "bg-zinc-50 border-zinc-200" : "bg-[#0b0c10] border-white/[0.06]"
                }`}>
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && aiPrompt.trim()) askGemini(aiPrompt); }}
                    placeholder="Ask code tutor a question..."
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${
                      isLightMode 
                        ? "bg-white border-zinc-200 text-zinc-800 focus:border-[#ff1a1a]/30" 
                        : "bg-[#07080a] border-white/[0.06] text-zinc-300 focus:border-[#ff1a1a]/30"
                    }`}
                  />
                  <button
                    onClick={() => askGemini(aiPrompt)}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-3.5 py-1.5 bg-[#ff1a1a] text-white rounded-lg hover:bg-[#e01616] text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
