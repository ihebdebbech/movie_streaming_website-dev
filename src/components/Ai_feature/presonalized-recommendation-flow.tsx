'use client';

import { useState } from 'react';

// 7 predefined questions for personalized recommendations
export const PERSONALIZATION_QUESTIONS = [
  {
    id: 1,
    question: 'Movies or TV Series?',
    type: 'single-choice',
    options: ['Movies', 'TV Series'],
  },
  {
    id: 2,
    question: 'What are the 3 "vibes" you are in the mood for?',
    type: 'single-choice',
    options: ['Action', 'Comedy', 'Horror', 'Sci-Fi', 'True Story' , 'Romance', 'Drama' , 'adventure' , 'Mystery'],
  },
  {
    id: 3,
    question: 'Do you prefer recent releases or classics?',
    type: 'single-choice',
    options: ['released this year', 'Recent (2020+)', 'Recent-ish (2010-2019)', 'Classic-ish (2000-2010)', ' Classics (Pre-2000)', 'Date dont matter'],
  },
  {
    id: 4,
    question: 'What is something you watched that you want a something similar to it ?',
    type: 'free-text',
    },
  {
    id: 5,
    question: 'How hard do you want to think? Do you want to ?',
    type: 'single-choice',
    options: ['turn your brain off', 'Requires 100% of your attention', ' doesnt matter'],

  },
  {
    id: 6,
    question: 'Is there anything you HATE? (DealBreakers)',
    type: 'free-text',
  },
  {
    id: 7,
    question: 'Anything else I should know about your preferences?',
    type: 'free-text',
  },
];

interface PersonalizedRecommendationFlowProps {
  onQuestionsComplete: (answers: Record<number, string>) => void;
}

export function PersonalizedRecommendationFlow({
  onQuestionsComplete,
}: PersonalizedRecommendationFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [freeTextInput, setFreeTextInput] = useState('');

  const currentQuestion = PERSONALIZATION_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === PERSONALIZATION_QUESTIONS.length - 1;

  const handleSelectOption = (option: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: option,
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      onQuestionsComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleFreeTextSubmit = () => {
    if (freeTextInput.trim()) {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: freeTextInput,
      };
      setAnswers(newAnswers);
      setFreeTextInput('');

      if (isLastQuestion) {
        onQuestionsComplete(newAnswers);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handleSkip = () => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: 'Skipped',
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      onQuestionsComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / PERSONALIZATION_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {currentQuestionIndex + 1}/{PERSONALIZATION_QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">{currentQuestion.question}</h4>

        {/* Single Choice Options */}
        {currentQuestion.type === 'single-choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                  answers[currentQuestion.id] === option
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Free Text Input */}
        {currentQuestion.type === 'free-text' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={freeTextInput}
              onChange={(e) => setFreeTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && freeTextInput.trim()) {
                  handleFreeTextSubmit();
                }
              }}
              placeholder="Type your answer or leave blank..."
              className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleFreeTextSubmit}
              disabled={!freeTextInput.trim()}
              className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Skip Button */}
      {currentQuestion.type === 'free-text' && (
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Skip this question
        </button>
      )}
    </div>
  );
}
