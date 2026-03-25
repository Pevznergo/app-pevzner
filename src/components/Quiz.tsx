"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// Placeholder data since questions will be provided separately
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "Какая ваша основная цель использования платформы?",
    options: ["Исследования", "Обучение", "Инвестиции", "Другое"],
  },
  {
    id: 2,
    question: "Какой у вас опыт в данной сфере?",
    options: ["Новичок", "Средний уровень", "Профессионал"],
  },
  {
    id: 3,
    question: "Как часто вы планируете пользоваться инструментами?",
    options: ["Каждый день", "Раз в неделю", "Раз в месяц", "Пока не уверен"],
  }
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const handleNext = () => {
    if (currentStep < MOCK_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Here you could send the answers to the backend
    }
  };

  const activeQuestion = MOCK_QUESTIONS[currentStep];

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="step-card text-center py-12"
      >
        <div className="w-16 h-16 bg-[rgba(139,92,246,0.15)] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-[var(--color-accent-purple)]" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-gradient">Опрос завершен!</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          Спасибо за ваши ответы. Мы подготовим индивидуальный результат для вас.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-secondary"
        >
          Начать заново
        </button>
      </motion.div>
    );
  }

  return (
    <div className="step-card">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-medium text-[var(--color-accent-blue)]">
            Вопрос {currentStep + 1} из {MOCK_QUESTIONS.length}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            {Math.round(((currentStep) / MOCK_QUESTIONS.length) * 100)}% завершено
          </span>
        </div>
        <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / MOCK_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-8">
            {activeQuestion.question}
          </h2>

          <div className="space-y-3 mb-8">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = answers[currentStep] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected 
                      ? "bg-[rgba(139,92,246,0.1)] border-[var(--color-accent-purple)]" 
                      : "bg-[rgba(255,255,255,0.03)] border-[var(--color-glass-border)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-[var(--color-accent-purple)]" : "border-[var(--color-text-muted)] mt-0.5"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-purple)]" />}
                    </div>
                    <span className={isSelected ? "text-white font-medium" : "text-[var(--color-text-muted)]"}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!answers[currentStep]}
              className={`btn-primary flex items-center gap-2 ${
                !answers[currentStep] ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {currentStep === MOCK_QUESTIONS.length - 1 ? "Завершить" : "Далее"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
