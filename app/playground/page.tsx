"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Play, CheckCircle, XCircle, Code, Copy, Trash,
  ArrowLeft, Lightbulb, Cpu, Sparkle, Gear, CloudArrowUp,
  TerminalWindow, FileCode, Keyboard, ArrowFatLineRight,
  UploadSimple, ChatCircle, DotsThree, Eye,
  ArrowSquareOut, Eraser, Stop
} from "@phosphor-icons/react";
import Editor from "@monaco-editor/react";

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.NEXT_PUBLIC_JUDGE0_API_KEY || "";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const languages = [
  { id: 50, name: "C (GCC 9.2.0)", extension: ".c", monaco: "c" },
  { id: 54, name: "C++ (GCC 9.2.0)", extension: ".cpp", monaco: "cpp" },
  { id: 62, name: "Java (OpenJDK 14.0)", extension: ".java", monaco: "java" },
  { id: 71, name: "Python (3.9.0)", extension: ".py", monaco: "python" },
  { id: 63, name: "JavaScript (Node.js 12.14.0)", extension: ".js", monaco: "javascript" },
  { id: 72, name: "Ruby (2.7.1)", extension: ".rb", monaco: "ruby" },
  { id: 73, name: "Rust (1.72.0)", extension: ".rs", monaco: "rust" },
  { id: 74, name: "TypeScript (5.0.3)", extension: ".ts", monaco: "typescript" },
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

type OutputTab = "stdout" | "stderr" | "compile" | "info";
type AITab = "chat" | "explain" | "fix" | "optimize";

export default function PlaygroundPage() {
  const [language, setLanguage] = useState(71);
  const [code, setCode] = useState(starterCode[71]);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [compileOutput, setCompileOutput] = useState("");
  const [execInfo, setExecInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [outputTab, setOutputTab] = useState<OutputTab>("stdout");
  const [showInput, setShowInput] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiMode, setAIMode] = useState<AITab>("chat");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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
    setExecInfo({});
    setOutputTab("stdout");
    setShowInput(false);
  };

const insertAtCursor = (p0: HTMLTextAreaElement | HTMLInputElement | null, text: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    const activeElement = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
    
    if (activeElement && (activeElement === textarea || activeElement === input)) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const before = activeElement.value.substring(0, start);
      const after = activeElement.value.substring(end, activeElement.value.length);
      activeElement.value = before + text + after;
      
      // Set cursor position after inserted text
      const newPosition = start + text.length;
      activeElement.setSelectionRange(newPosition, newPosition);
      
      // Trigger change event
      activeElement.dispatchEvent(new Event('input',{ bubbles: true }));
      
      // Update state
      if (activeElement === textarea) {
        setStdin(activeElement.value);
      } else if (activeElement === input) {
        setAiPrompt(activeElement.value);
      }
    } else {
      // If no input is focused, just insert into AI prompt
      setAiPrompt(prev => prev + text);
    }
  };

  const activeLang = languages.find((l) => l.id === language);

  const runCode = async () => {
    setLoading(true);
    setStdout("");
    setStderr("");
    setCompileOutput("");
    setExecInfo({});
    setOutputTab("stdout");

    if (!JUDGE0_KEY) {
      setStderr("Code execution requires JUDGE0_API_KEY. Set it in environment variables.");
      setOutputTab("stderr");
      setLoading(false);
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
        setStderr("API request failed with status " + submitRes.status);
        setOutputTab("stderr");
        return;
      }

      const result = await submitRes.json();
      setStdout(result.stdout || "");
      setStderr(result.stderr || "");
      setCompileOutput(result.compile_output || "");
      setExecInfo({
        "Time": (result.time || "—") + "s",
        "Memory": (result.memory || "—") + " KB",
        "Exit Code": String(result.exit_code ?? "—"),
        "Status": result.status?.description || "—"
      });

      if (result.stderr) setOutputTab("stderr");
      else if (result.compile_output) setOutputTab("compile");
      else if (result.stdout) setOutputTab("stdout");
      else setOutputTab("info");
    } catch {
      setStderr("Execution failed — check your network and API key.");
      setOutputTab("stderr");
    } finally {
      setLoading(false);
    }
  };

  const askGemini = useCallback(async (prompt: string, mode: AITab) => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    setChatHistory(h => [...h, { role: "user", content: prompt }]);

    const systemPrompts: Record<AITab, string> = {
      chat: "You are an expert programming tutor. Answer the user's coding question clearly and concisely with examples.",
      explain: "Explain the following code in detail, line by line. Assume the reader is a beginner.",
      fix: "Review the following code for bugs, errors, and improvements. List each issue and provide the corrected code.",
      optimize: "Analyze the following code for performance improvements. Suggest specific optimizations with code examples."
    };

    const fullPrompt = `${systemPrompts[mode]}\n\nCurrent code (${activeLang?.name}):\n\`\`\`\n${code}\n\`\`\`\n\nUser: ${prompt}\n\nRespond with clear, formatted code examples.`;

    if (!GEMINI_KEY) {
      const mockResponse = getMockAIResponse(prompt, mode);
      setAiResponse(mockResponse);
      setChatHistory(h => [...h, { role: "assistant", content: mockResponse }]);
      setAiLoading(false);
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
              temperature: 0.4,
              maxOutputTokens: 2048,
              topP: 0.9,
              topK: 40
            }
          })
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Gemini API error:", errText);
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

      if (!text || text.includes("does not support image input")) {
        throw new Error("AI model temporarily unavailable - using fallback");
      }

      setAiResponse(text);
      setChatHistory(h => [...h, { role: "assistant", content: text }]);
    } catch (err: any) {
      console.error("Gemini error:", err);
      const fallback = getMockAIResponse(prompt, mode);
      const errorMessage = err?.message || "AI service unavailable";
      setAiResponse(fallback + "\n\n⚠️ " + errorMessage);
      setChatHistory(h => [...h, { role: "assistant", content: fallback + "\n\n⚠️ " + errorMessage }]);
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  }, [code, activeLang?.name]);

  // const copyToClipboard = async (text: string) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   } catch { /* silent */ }
  // };


  // const insertAtCursor = (text: string) => {
  //   const activeElement = document.activeElement;
  //   if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
  //     const element = activeElement as HTMLTextAreaElement | HTMLInputElement;
  //     const start = element.selectionStart || 0;
  //     const end = element.selectionEnd || 0;
  //     const before = element.value.substring(0, start);
  //     const after = element.value.substring(end, element.value.length);
  //     element.value = before + text + after;
      
  //     // Set cursor position after inserted text
  //     const newPosition = start + text.length;
  //     element.setSelectionRange(newPosition, newPosition);
      
  //     // Trigger change event and update state
  //     element.dispatchEvent(new Event('input', { bubbles: true }));
      
  //     if (element === document.querySelector('textarea')) {
  //       setStdin(element.value);
  //     } else if (element === document.querySelector('input[type="text"]')) {
  //       setAiPrompt(element.value);
  //     }
  //   } else {
  //     // If no input is focused, just insert into AI prompt
  //     setAiPrompt(prev => prev + text);
  //   }
  // };

  const outputContent = () => {
    switch (outputTab) {
      case "stdout": return stdout || "Program produced no standard output.";
      case "stderr": return stderr || "No standard error output.";
      case "compile": return compileOutput || "No compilation output.";
      case "info": return Object.entries(execInfo).map(([k, v]) => `${k}: ${v}`).join("\n") || "Execution info will appear here.";
    }
  };

  return (
    <div className="h-full w-full bg-[#0d0d0d] text-[#e0e0e0] flex flex-col font-mono text-sm overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="h-11 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-3 select-none shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group" title="Back to Dashboard">
            <ArrowLeft size={18} className="text-[#888] group-hover:text-white" weight="bold" />
          </Link>
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <div className="flex items-center gap-2.5">
            <Code size={18} weight="bold" className="text-brand" />
            <span className="font-bold text-xs tracking-wider text-white/80">Playground</span>
            {!JUDGE0_KEY && (
              <span className="text-[10px] text-yellow-500 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                Mock Execution
              </span>
            )}
            {!GEMINI_KEY && (
              <span className="text-[10px] text-blue-500 bg-blue-500/20 px-2 py-0.5 rounded-full">
                Mock AI
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5">
            <FileCode size={14} className="text-brand" />
            <select
              value={language}
              onChange={(e) => {
                const id = Number(e.target.value);
                setLanguage(id);
                if (!code || code === starterCode[language]) setCode(starterCode[id] || "");
              }}
              className="bg-transparent text-[#ccc] text-[11px] focus:outline-none cursor-pointer font-medium"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-[#0d0d0d]">{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={resetAll} className="p-1.5 text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Reset">
              <Eraser size={15} />
            </button>
            <button onClick={() => copyToClipboard(code)} className="p-1.5 text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-all relative" title="Copy Code">
              {copied ? <CheckCircle size={15} className="text-green-400" weight="fill" /> : <Copy size={15} />}
            </button>
            <button className="p-1.5 text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Save">
              <CloudArrowUp size={15} />
            </button>
          </div>

          <div className="w-px h-5 bg-[#2a2a2a]" />

          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-1.5 bg-brand text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-lg shadow-brand/25"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={13} weight="fill" />
            )}
            Run
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Side */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-9 px-4 bg-[#121212] border-b border-[#2a2a2a] flex items-center gap-2 text-[11px] text-brand/80 font-medium">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border-t-2 border-brand">
              <FileCode size={14} className="text-brand" />
              main{activeLang?.extension}
            </div>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={activeLang?.monaco || "plaintext"}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 22,
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                roundedSelection: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "phase",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                renderWhitespace: "selection",
                guides: { indentation: true, bracketPairs: true },
              }}
            />
          </div>

          {/* Input Toggle Bar */}
          <div className="flex items-center justify-between h-9 px-3 bg-[#121212] border-t border-[#2a2a2a] shrink-0">
            <button
              onClick={() => setShowInput(!showInput)}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
                showInput ? 'bg-brand/20 text-brand' : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              <Keyboard size={13} /> Input{showInput ? ' ▲' : ' ▼'}
            </button>
            <div className="flex items-center gap-3 text-[10px] text-[#555]">
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-500/50" /> Ln 1</span>
              <span className="flex items-center gap-1"><Cpu size={11} /> {activeLang?.name}</span>
            </div>
          </div>

          {/* Stdin Input Panel */}
          {showInput && (
            <div className="h-[120px] border-t border-[#2a2a2a] bg-[#0d0d0d] p-2 shrink-0">
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <ArrowFatLineRight size={12} className="text-brand" weight="fill" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#666]">Standard Input (stdin)</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Type input your program will read from stdin..."
                className="w-full h-[76px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2.5 text-xs text-[#ccc] font-mono focus:outline-none focus:border-brand/40 resize-none placeholder:text-[#444]"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Output & AI Panel */}
        <div className="w-[460px] flex flex-col bg-[#0d0d0d] border-l border-[#2a2a2a] shrink-0">
          {/* Output Tabs */}
          <div className="flex bg-[#121212] border-b border-[#2a2a2a]">
            {[
              { id: "stdout" as OutputTab, label: "Output", icon: TerminalWindow },
              { id: "stderr" as OutputTab, label: "Errors", icon: XCircle },
              { id: "compile" as OutputTab, label: "Compile", icon: FileCode },
              { id: "info" as OutputTab, label: "Info", icon: Eye },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setOutputTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all ${
                  outputTab === id
                    ? 'border-brand text-white bg-brand/5'
                    : 'border-transparent text-[#555] hover:text-[#999]'
                }`}
              >
                <Icon size={13} />
                {label}
                {id === "stderr" && stderr && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowAI(!showAI)}
              className={`px-3 py-2.5 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                showAI ? 'border-brand text-white bg-brand/5' : 'border-transparent text-[#555] hover:text-[#999]'
              }`}
            >
              <Sparkle size={13} weight="fill" className={showAI ? 'text-brand' : ''} />
              AI
            </button>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-4 text-sm leading-relaxed font-mono">
            {outputTab === "info" && Object.keys(execInfo).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(execInfo).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#2a2a2a]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555]">{k}</span>
                    <span className="text-xs font-semibold text-white/70">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className={`whitespace-pre-wrap text-[13px] ${
                outputTab === "stderr" ? 'text-red-400' :
                outputTab === "compile" ? 'text-yellow-400' :
                'text-[#aaa]'
              }`}>
                {outputContent()}
              </pre>
            )}

            {!stdout && !stderr && !compileOutput && Object.keys(execInfo).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                <TerminalWindow size={40} weight="duotone" />
                <p className="text-xs font-medium">Run your code to see output</p>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase">Ctrl + Enter</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Panel */}
          {showAI && (
            <div className="h-[280px] border-t border-[#2a2a2a] bg-[#121212] flex flex-col shrink-0">
              {/* AI Mode Tabs */}
              <div className="flex border-b border-[#2a2a2a] bg-[#0d0d0d]">
                {[
                  { id: "chat" as AITab, label: "Chat", icon: ChatCircle },
                  { id: "explain" as AITab, label: "Explain", icon: Lightbulb },
                  { id: "fix" as AITab, label: "Fix", icon: XCircle },
                  { id: "optimize" as AITab, label: "Optimize", icon: Sparkle },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setAIMode(id); setAiResponse(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[9px] uppercase tracking-wider font-bold transition-all ${
                      aiMode === id ? 'text-brand bg-brand/10 border-b-2 border-brand' : 'text-[#555] hover:text-[#999]'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* AI Chat */}
              <div className="flex-1 overflow-auto p-3 space-y-2" ref={aiPanelRef}>
                {chatHistory.length === 0 && !aiResponse && (
                  <div className="text-[#555] text-[11px] text-center py-8">
                    <Sparkle size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Ask the AI {aiMode === "chat" ? "a coding question" : `to ${aiMode} your code`}</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-2 text-xs ${msg.role === 'user' ? '' : ''}`}>
                    <div className={`rounded-lg px-3 py-2 w-full ${
                      msg.role === 'user' ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-[#0a0a0a] border border-brand/10'
                    }`}>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#555] mb-1">
                        {msg.role === 'user' ? 'You' : 'Gemini'}
                      </div>
                      <pre className="whitespace-pre-wrap text-[#ccc] leading-relaxed font-mono text-[11px]">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-[#555] text-xs px-3 py-2">
                    <span className="w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Gemini is thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* AI Input */}
              <div className="p-2 border-t border-[#2a2a2a] bg-[#0d0d0d]">
                <div className="flex gap-2">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim()) { e.preventDefault(); askGemini(aiPrompt, aiMode); } }}
                    placeholder={
                      aiMode === "chat" ? "Ask anything about your code..." :
                      aiMode === "explain" ? "Select code to explain or ask a question..." :
                      aiMode === "fix" ? "Describe the bug or issue..." :
                      "Describe what needs optimization..."
                    }
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ccc] focus:outline-none focus:border-brand/40 placeholder:text-[#444]"
                  />
                  <button
                    onClick={() => { if (aiPrompt.trim()) askGemini(aiPrompt, aiMode); }}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-3 py-2 bg-brand text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-30 flex items-center gap-1 text-xs font-bold"
                  >
                    {aiLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowFatLineRight size={14} weight="fill" />}
                  </button>
                </div>
                 <div className="flex items-center gap-2 mt-1.5 px-1">
                   <button onClick={() => {
                     const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                     const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                     insertAtCursor(document.activeElement === textarea ? textarea : document.activeElement === input ? input : null, "```\n" + code + "\n```");
                   }} className="text-[9px] text-[#444] hover:text-[#888] transition-colors flex items-center gap-1">
                     <Code size={10} /> Insert Code
                   </button>
                   <button onClick={() => setAiPrompt(`"""\n${code}\n"""\n\n`)} className="text-[9px] text-[#444] hover:text-[#888] transition-colors">
                     Send Current Code
                   </button>
                   <span className="text-[8px] text-[#333] ml-auto">
                     {GEMINI_KEY ? '⚡ Gemini 2.0 Flash' : '⚡ Mock AI (Add GEMINI_KEY for real AI)'}
                   </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMockAIResponse(prompt: string, mode: AITab): string {
  const responses: Record<AITab, string[]> = {
    chat: [
      "Here's how you can approach this problem:\n\n1. **Break it down** — split the task into smaller sub-problems\n2. **Use helper functions** — keep your code DRY\n3. **Test edge cases** — empty input, negative values, etc.\n\nWould you like me to write a specific implementation?",
      "Good question! Here's a clean solution:\n\n```python\ndef solve(data):\n    result = []\n    for item in data:\n        if item.is_valid():\n            result.append(item.process())\n    return result\n```\n\nThis handles the common case. Let me know if you need modifications!",
      "The key insight here is to use a hash map for O(1) lookups:\n\n```javascript\nconst lookup = new Map(items.map(i => [i.id, i]));\nreturn ids.map(id => lookup.get(id)).filter(Boolean);\n```"
    ],
    explain: [
      "Here's a line-by-line breakdown:\n\n1. **Imports** — bringing in standard libraries for I/O operations\n2. **Main function** — the entry point of the program\n3. **Variable declarations** — memory allocation and initialization\n4. **Control flow** — loops and conditionals that direct execution\n5. **Output** — print statements that communicate results\n\nThe overall pattern follows the standard input-process-output model.",
      "Let me explain what this code does:\n\n- It starts by setting up necessary data structures\n- Then it enters the main processing loop\n- Each iteration handles one unit of work\n- Results are accumulated and returned at the end\n\nThe time complexity is O(n) where n is the input size."
    ],
    fix: [
      "I found a few issues in your code:\n\n1. **Missing semicolon** on line 12 — JavaScript requires semicolons in this context\n2. **Off-by-one error** on line 18 — your loop condition should be `<` not `<=`\n3. **Unhandled edge case** — what happens when the input is empty?\n\nHere's the corrected version:\n\n```javascript\nfunction process(items) {\n  if (!items?.length) return [];\n  return items.map(item => item.value);\n}\n```",
      "Potential bugs detected:\n\n1. **Null reference** — variable might be undefined when accessed\n2. **Type coercion** — comparing string to number without conversion\n3. **Resource leak** — file handle not closed on error path"
    ],
    optimize: [
      "Performance optimization suggestions:\n\n1. **Use a Set instead of Array** — reduces lookup from O(n) to O(1)\n2. **Memoize repeated calculations** — cache expensive function calls\n3. **Batch DOM updates** — avoid layout thrashing\n4. **Lazy loading** — defer initialization\n\nEstimated improvement: ~60% faster execution",
      "To optimize this code:\n\n1. **Move invariant calculations** out of the loop\n2. **Use local variables** instead of repeated property access\n3. **Consider early returns** to avoid unnecessary work\n4. **Replace recursion with iteration** for better stack usage"
    ]
  };
  const list = responses[mode];
  return list[Math.floor(Math.random() * list.length)];
}
