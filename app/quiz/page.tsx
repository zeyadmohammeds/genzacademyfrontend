"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Play, CheckCircle, XCircle, Clock, 
  ArrowLeft, ArrowRight, Trophy, Star,
  Code, Lightbulb, Timer
} from "@phosphor-icons/react";

const mockQuizzes = [
  {
    id: "1",
    title: "C++ Variables & Data Types",
    description: "Test your understanding of basic C++ data types",
    questions: 5,
    duration: 15,
    difficulty: "Beginner",
    xpReward: 100,
    status: "completed" as const,
    score: 80,
  },
  {
    id: "2",
    title: "Scratch Logic Fundamentals",
    description: "Core programming concepts in Scratch",
    questions: 8,
    duration: 20,
    difficulty: "Beginner",
    xpReward: 150,
    status: "available" as const,
  },
  {
    id: "3",
    title: "Web Development Basics",
    description: "HTML, CSS, and basic JavaScript",
    questions: 10,
    duration: 25,
    difficulty: "Intermediate",
    xpReward: 200,
    status: "available" as const,
  },
  {
    id: "4",
    title: "Arduino Programming",
    description: "Microcontroller logic and sensor programming",
    questions: 12,
    duration: 30,
    difficulty: "Advanced",
    xpReward: 300,
    status: "locked" as const,
  },
];

export default function QuizPage() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuiz = mockQuizzes.find(q => q.id === activeQuiz);

  const questions = [
    {
      question: "What is the correct way to declare an integer variable in C++?",
      options: [
        "int x = 5;",
        "string x = 5;",
        "float x = 5;",
        "bool x = 5;",
      ],
      correct: 0,
    },
    {
      question: "Which data type is used to store true/false values?",
      options: ["int", "string", "bool", "char"],
      correct: 2,
    },
    {
      question: "What does 'cout' do in C++?",
      options: [
        "Takes input from user",
        "Outputs to console",
        "Declares a variable",
        "Creates a loop",
      ],
      correct: 1,
    },
    {
      question: "Which operator is used for equality comparison?",
      options: ["=", "==", "!=", "==="],
      correct: 1,
    },
    {
      question: "What is the output of: cout << 5 + 3;",
      options: ["53", "8", "5 + 3", "Error"],
      correct: 1,
    },
  ];

  if (activeQuiz && currentQuiz) {
    if (showResults) {
      const correctCount = questions.filter((q, i) => answers[i] === String(q.correct)).length;
      const score = Math.round((correctCount / questions.length) * 100);
      
      return (
        <div className="min-h-screen bg-canvas-soft px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[3rem] p-10 border border-black/5 shadow-xl text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand/10 flex items-center justify-center">
                <Trophy size={48} weight="fill" className="text-brand" />
              </div>
              <h2 className="text-3xl font-display font-black text-zinc-900 mb-2">Quiz Complete!</h2>
              <p className="text-zinc-500 font-medium mb-8">You scored {score}%</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-brand/10 rounded-2xl p-4">
                  <div className="text-2xl font-black text-brand">{correctCount}</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase">Correct</div>
                </div>
                <div className="bg-zinc-100 rounded-2xl p-4">
                  <div className="text-2xl font-black text-zinc-900">{questions.length - correctCount}</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase">Wrong</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => { setShowResults(false); setAnswers({}); setCurrentQuestion(0); }} className="flex-1 py-4 bg-zinc-100 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-200 transition-colors">
                  Retry Quiz
                </button>
                <button onClick={() => { setActiveQuiz(null); setShowResults(false); setAnswers({}); setCurrentQuestion(0); }} className="flex-1 py-4 bg-brand text-brand-fg font-bold rounded-2xl hover:bg-brand-hover transition-colors">
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-canvas-soft px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setActiveQuiz(null)} className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-900">
              <ArrowLeft size={20} weight="bold" /> Exit
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-black/5">
              <Timer size={16} weight="bold" className="text-zinc-400" />
              <span className="text-sm font-bold text-zinc-900">15:00</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm mb-6">
            <h2 className="text-xl font-display font-black text-zinc-900 mb-8">{questions[currentQuestion].question}</h2>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQuestion]: i.toString() })}
                  className={`w-full p-4 rounded-2xl text-left font-bold transition-all ${
                    answers[currentQuestion] === i.toString()
                      ? 'bg-brand text-brand-fg ring-2 ring-brand'
                      : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-white/20 inline-flex items-center justify-center mr-3 text-sm">{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="flex-1 py-4 bg-white text-zinc-900 font-bold rounded-2xl border border-black/5 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={() => setShowResults(true)}
                className="flex-1 py-4 bg-brand text-brand-fg font-bold rounded-2xl hover:bg-brand-hover transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="flex-1 py-4 bg-ink text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-soft px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-black text-zinc-900 tracking-tight">Quizzes & Assessments</h1>
          <p className="text-zinc-500 font-medium mt-2">Test your knowledge and earn XP!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockQuizzes.map((quiz) => (
            <div key={quiz.id} className={`bg-white rounded-[3rem] p-8 border border-black/5 shadow-sm ${quiz.status === 'locked' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                  quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {quiz.difficulty}
                </span>
                {quiz.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                    <CheckCircle size={14} weight="fill" /> {quiz.score}%
                  </span>
                ) : quiz.status === 'locked' ? (
                  <span className="text-zinc-400 text-xs font-bold">🔒 Locked</span>
                ) : null}
              </div>
              
              <h3 className="text-xl font-display font-black text-zinc-900 mb-2">{quiz.title}</h3>
              <p className="text-sm text-zinc-500 font-medium mb-6">{quiz.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1"><Code size={14} /> {quiz.questions} Qs</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {quiz.duration} min</span>
                </div>
                <div className="flex items-center gap-1 text-brand font-bold text-sm">
                  <Star size={14} weight="fill" /> +{quiz.xpReward} XP
                </div>
              </div>
              
              <button
                onClick={() => quiz.status !== 'locked' && setActiveQuiz(quiz.id)}
                disabled={quiz.status === 'locked'}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                  quiz.status === 'completed'
                    ? 'bg-zinc-100 text-zinc-700'
                    : quiz.status === 'locked'
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : 'bg-brand text-brand-fg hover:bg-brand-hover'
                }`}
              >
                {quiz.status === 'completed' ? 'Retake Quiz' : quiz.status === 'locked' ? 'Locked' : 'Start Quiz'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}