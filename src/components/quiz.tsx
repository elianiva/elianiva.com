"use client";

import { useState } from "react";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizResponse {
  title: string;
  message: string;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
  correctResponse: QuizResponse;
  errorResponse: QuizResponse;
}

export function Quiz({ question, options, correctResponse, errorResponse }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSelect = (id: string) => {
    if (showResult) return;
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected) return;
    const isCorrect = options.find((o) => o.id === selected)?.isCorrect ?? false;
    if (!isCorrect) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    setShowResult(true);
  };

  const handleRetry = () => {
    setSelected(null);
    setShowResult(false);
    setIsShaking(false);
  };

  const isCorrect = selected ? (options.find((o) => o.id === selected)?.isCorrect ?? false) : false;
  const response = isCorrect ? correctResponse : errorResponse;

  return (
    <div
      className={`my-8 border border-pink-200/50 bg-white/60 p-6 ${isShaking ? "animate-shake" : ""}`}
    >
      <p
        className="font-display font-semibold text-pink-950 mb-4"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div className="space-y-2 mb-6">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const showCorrect = showResult && option.isCorrect;
          const showWrong = showResult && isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full text-left p-3 border transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2
                ${showCorrect ? "border-green-400 bg-green-50/50" : ""}
                ${showWrong ? "border-red-400 bg-red-50/50" : ""}
                ${isSelected && !showResult ? "border-pink-400 bg-pink-50/50" : ""}
                ${!isSelected && !showResult ? "border-pink-200/50 bg-white/40 hover:bg-white/80" : ""}
                ${showResult && !isSelected && !option.isCorrect ? "opacity-50" : ""}
              `}
              disabled={showResult}
            >
              <span className="font-mono text-sm text-pink-950/60 mr-3">{option.id}.</span>
              <span
                className="text-sm text-pink-950/80"
                dangerouslySetInnerHTML={{ __html: option.text }}
              />
            </button>
          );
        })}
      </div>

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-pink-50/80 hover:bg-pink-50 border border-pink-200/50 hover:border-pink-200 py-2 px-6 text-sm font-mono text-pink-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
        >
          Submit
        </button>
      ) : (
        <div
          className={`border-l-4 p-4 ${isCorrect ? "border-green-400 bg-green-50/30" : "border-red-400 bg-red-50/30"}`}
        >
          <p
            className={`font-display font-semibold mb-1 ${isCorrect ? "text-green-700" : "text-red-700"}`}
            dangerouslySetInnerHTML={{ __html: response.title }}
          />
          <p
            className="text-sm text-pink-950/70"
            dangerouslySetInnerHTML={{ __html: response.message }}
          />
          {!isCorrect && (
            <button
              onClick={handleRetry}
              className="mt-3 bg-white/60 hover:bg-white border border-pink-200/50 hover:border-pink-200 py-1.5 px-4 text-xs font-mono text-pink-950 transition-all focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
