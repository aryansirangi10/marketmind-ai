// ==============================================================================
// Financial Learning Center - Frontend Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  BookOpen, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Lock 
} from "lucide-react";

interface Badge {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
}

export default function LearningCenterPage() {
  const [activeCourseId, setActiveCourseId] = useState("foundations");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const courses = [
    {
      id: "foundations",
      title: "Stock Market Foundations",
      category: "Beginner Investing",
      level: "BEGINNER",
      description: "Learn how ticker feeds, order books, and exchanges coordinate globally.",
      quizzesCount: 3,
      progress: 65,
      isUnlocked: true
    },
    {
      id: "technical",
      title: "Technical Analysis",
      category: "Market Analysis",
      level: "INTERMEDIATE",
      description: "Understand chart candlestick patterns, volume indicators, and oscillators.",
      quizzesCount: 5,
      progress: 20,
      isUnlocked: true
    },
    {
      id: "options",
      title: "Options Trading & Hedging",
      category: "Advanced Derivatives",
      level: "ADVANCED",
      description: "Demystify call/put options contracts, volatility metrics, and delta hedging rules.",
      quizzesCount: 8,
      progress: 0,
      isUnlocked: false
    }
  ];

  const quiz: QuizQuestion = {
    id: "quiz_1",
    question: "What does the bid price represent in an asset's order book?",
    options: [
      "The maximum price a buyer is willing to pay to purchase shares",
      "The minimum price a seller is willing to accept to dispose shares",
      "The historical average transaction price over the preceding session"
    ],
    correctIdx: 0
  };

  const badges: Badge[] = [
    { name: "Novice Scholar", description: "Completed your first quiz challenge.", icon: "Award", unlocked: true },
    { name: "Quant Apprentice", description: "Answered 5 technical finance questions.", icon: "BookOpen", unlocked: false },
    { name: "Risk Manager", description: "Achieved 100% on the portfolio hedging module.", icon: "CheckCircle2", unlocked: false }
  ];

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    setScore(selectedAnswer === quiz.correctIdx ? 100 : 0);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(null);
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Learning Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore structured financial paths, test your skills, and earn performance achievement badges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Courses List Section */}
          <div className="lg:col-span-2 space-y-4 select-none">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Educational Pathways</h3>
            
            {courses.map((course) => (
              <div 
                key={course.id}
                onClick={() => { if (course.isUnlocked) setActiveCourseId(course.id); }}
                className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  activeCourseId === course.id 
                    ? "border-indigo-500/50 bg-indigo-500/5" 
                    : "border-border hover:border-white/10"
                } ${!course.isUnlocked ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-border text-[9px] font-bold text-muted-foreground uppercase">
                      {course.level}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold">{course.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {course.title} {!course.isUnlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{course.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Progress indicators */}
                  {course.isUnlocked && (
                    <div className="flex flex-col items-end gap-1 font-mono">
                      <span className="text-[10px] text-muted-foreground">Path Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-white">{course.progress}%</span>
                      </div>
                    </div>
                  )}
                  {course.isUnlocked && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Achievements and badging */}
          <div className="glass-card p-5 rounded-2xl border border-border space-y-6 lg:col-span-1 select-none">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> Unlocked Badges
              </h3>
              <p className="text-[10px] text-muted-foreground">Answer quizzes to claim investment skills achievements</p>
            </div>

            <div className="space-y-4">
              {badges.map((badge, idx) => (
                <div key={idx} className={`flex items-center gap-3.5 p-3 rounded-xl border ${
                  badge.unlocked ? "bg-white/5 border-border text-white" : "border-border/30 opacity-40 text-muted-foreground"
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    badge.unlocked ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-slate-900 border-border text-slate-500"
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{badge.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Module Row */}
        <div className="glass-card p-6 rounded-2xl border border-border space-y-5">
          <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 uppercase select-none">
            <HelpCircle className="w-4 h-4 text-indigo-400" /> Active Quiz Challenge
          </h3>

          <div className="space-y-4 max-w-3xl">
            <p className="text-xs font-semibold text-white leading-relaxed select-none">{quiz.question}</p>

            <div className="space-y-2">
              {quiz.options.map((opt, idx) => {
                let cardStyle = "border-border hover:border-white/10 hover:bg-white/[0.01]";
                if (selectedAnswer === idx) {
                  cardStyle = "border-indigo-500/80 bg-indigo-500/5 text-indigo-300";
                }
                if (isAnswered) {
                  if (idx === quiz.correctIdx) {
                    cardStyle = "border-green-500/80 bg-green-500/5 text-green-300";
                  } else if (selectedAnswer === idx) {
                    cardStyle = "border-red-500/80 bg-red-500/5 text-red-300";
                  }
                }
                
                return (
                  <div
                    key={idx}
                    onClick={() => { if (!isAnswered) setSelectedAnswer(idx); }}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer font-medium ${cardStyle}`}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === null}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  SUBMIT ANSWER
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  NEXT QUESTION
                </button>
              )}

              {/* Quiz alerts feedback */}
              {isAnswered && score === 100 && (
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+100 points)
                </div>
              )}
              {isAnswered && score === 0 && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                  <XCircle className="w-4 h-4" /> Incorrect Answer. Try again!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
