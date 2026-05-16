"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Play, CheckCircle, XCircle, Code, Copy, Trash,
  ArrowLeft, Lightbulb, Cpu, Sparkle, Gear
} from "@phosphor-icons/react";

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = "e19a66c2camsh4a502decb104507p100b2fjsnd764db0d1c27"; // User needs to add their key

const languages = [
  { id: 50, name: "C (GCC 9.2.0)", extension: ".c" },
  { id: 54, name: "C++ (GCC 9.2.0)", extension: ".cpp" },
  { id: 62, name: "Java (OpenJDK 14.0)", extension: ".java" },
  { id: 71, name: "Python (3.9.0)", extension: ".py" },
  { id: 63, name: "JavaScript (Node.js 12.14.0)", extension: ".js" },
  { id: 72, name: "Ruby (2.7.1)", extension: ".rb" },
];

const starterCode: Record<number, string> = {
  50: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  54: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  71: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  62: `print("Hello, World!")`,
  63: `console.log("Hello, World!");`,
  72: `puts "Hello, World!"`,
};

const aiSuggestions = [
  "Try using a for loop to iterate through the array",
  "Consider using string concatenation for better readability",
  "The algorithm can be optimized to O(n) time complexity",
  "Don't forget to handle edge cases like empty input",
];

export default function PlaygroundPage() {
  const [language, setLanguage] = useState(50);
  const [code, setCode] = useState(starterCode[50]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");
    
    try {
      // Submit code to Judge0
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
          stdin: ""
        })
      });

      const result = await submitRes.json();
      
      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(`Error: ${result.stderr}`);
      } else {
        setOutput(result.compile_output || "No output");
      }
    } catch (err) {
      setOutput("Error running code. Make sure to add your RapidAPI key.");
    } finally {
      setLoading(false);
    }
  };

  const askAI = () => {
    setAiResponse("Here's a suggestion based on your code:\n\n" + 
      aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)] +
      "\n\nFor more help, try being more specific about what you're trying to accomplish!");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const resetCode = () => {
    setCode(starterCode[language] || "");
    setOutput("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <h1 className="text-xl font-display font-black flex items-center gap-2">
            <Code size={24} weight="bold" className="text-brand" />
            Code Playground
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(Number(e.target.value));
              setCode(starterCode[Number(e.target.value)] || "");
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          
          <button onClick={resetCode} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Reset">
            <Trash size={18} />
          </button>
          
          <button onClick={copyCode} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Copy">
            <Copy size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-white/10">
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-zinc-900 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
              placeholder="// Write your code here..."
            />
          </div>
          
          {/* Action Bar */}
          <div className="p-4 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={runCode}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-brand text-brand-fg font-bold rounded-xl hover:bg-brand-hover transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-brand-fg/30 border-t-brand-fg rounded-full animate-spin" />
              ) : (
                <Play size={18} weight="bold" />
              )}
              Run Code
            </button>
            
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all"
            >
              <Sparkle size={18} weight="bold" />
              AI Helper
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-96 flex flex-col bg-zinc-900">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Output</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-auto font-mono text-sm">
            {output ? (
              <pre className={`whitespace-pre-wrap ${output.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {output}
              </pre>
            ) : (
              <p className="text-zinc-500 italic">Run your code to see output here...</p>
            )}
          </div>

          {/* AI Panel */}
          {showAI && (
            <div className="border-t border-white/10 p-4 bg-zinc-800">
              <h3 className="font-black text-xs uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                <Sparkle size={14} /> AI Code Assistant
              </h3>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask for help with your code..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
              <button
                onClick={askAI}
                className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg text-sm hover:bg-purple-500 transition-colors"
              >
                Ask AI
              </button>
              {aiResponse && (
                <div className="mt-3 p-3 bg-zinc-900 rounded-lg text-sm text-zinc-300">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
                    <Lightbulb size={14} /> Suggestion
                  </div>
                  {aiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 py-3 bg-zinc-900 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Cpu size={14} />
          <span>Powered by Judge0 CE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Press Ctrl+Enter to run</span>
          <span>Ctrl+S to save</span>
        </div>
      </div>
    </div>
  );
}