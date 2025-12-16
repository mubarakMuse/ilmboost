"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quizQuestions, calculateScore } from "./quizData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import config from "@/config";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answer) => {
    if (showExplanation) return; // Don't allow changing answer after submission
    
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer
    };
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete - calculate results
      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: selectedAnswer
      };
      const results = calculateScore(finalAnswers);
      setQuizResults(results);
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizResults(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  if (showResults && quizResults) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results - Minimal Design */}
            <div className="text-center mb-12">
              <div className="text-5xl sm:text-6xl font-bold text-black mb-4">
                {quizResults.percentage}%
              </div>
              <div className="text-lg text-gray-600 mb-8">
                {quizResults.score} out of {quizResults.total} correct
              </div>
              <p className="text-base text-gray-700 max-w-md mx-auto mb-12">
                {quizResults.recommendation}
              </p>
            </div>

            {/* CTA - Minimal Design */}
            <div className="border-2 border-black rounded-xl p-8 sm:p-10 bg-white">
              <h2 className="text-2xl sm:text-3xl font-serif text-black mb-4 text-center">
                Ready to learn more?
              </h2>
              <p className="text-base text-gray-600 mb-8 text-center">
                Join Ilm Boost to access comprehensive Islamic studies courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-[#F5E6D3] hover:bg-[#E8D4B8] text-black font-medium rounded-md transition-colors text-center"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/courses"
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-black font-medium border border-black rounded-md transition-colors text-center"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Retake Quiz */}
            <div className="text-center mt-8">
              <button
                onClick={handleRetake}
                className="text-sm text-gray-600 hover:text-black transition-colors underline"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black mb-4">
              Test Your Islamic Knowledge
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Challenge yourself with questions about Tafseer, Hadith Sciences, and Islamic knowledge
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-black h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-lg sm:text-xl font-semibold text-black mb-6">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                let buttonClass = "w-full text-left px-4 py-3 border-2 rounded-lg transition-all duration-200 font-medium";
                
                if (showExplanation) {
                  const isCorrect = option === currentQuestion.correctAnswer;
                  if (isCorrect) {
                    buttonClass += " bg-gray-100 border-black text-black";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-gray-50 border-gray-300 text-gray-500";
                  } else {
                    buttonClass += " border-gray-200 text-gray-400";
                  }
                } else {
                  if (isSelected) {
                    buttonClass += " bg-[#F5E6D3] border-black text-black";
                  } else {
                    buttonClass += " border-gray-300 text-black bg-white hover:bg-gray-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showExplanation}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-2">
                      {showExplanation && option === currentQuestion.correctAnswer && (
                        <span className="text-black font-bold">✓</span>
                      )}
                      {showExplanation && isSelected && option !== currentQuestion.correctAnswer && (
                        <span className="text-gray-400 font-bold">✗</span>
                      )}
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2 text-black">
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? "Correct"
                      : "Explanation:"}
                  </div>
                  <div>
                    {currentQuestion.explanation}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setSelectedAnswer(answers[quizQuestions[currentQuestionIndex - 1].id] || null);
                    setShowExplanation(false);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-black font-medium border border-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {!showExplanation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? "Next →" : "View Results"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

