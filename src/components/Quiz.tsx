"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react";

const CREDIT_QUESTIONS = [
  {
    id: 1,
    question: "Have you received Google Cloud for Startups credits?",
    credit: 2000,
    label: "Google Cloud for Startups",
  },
  {
    id: 2,
    question: "Have you received AWS Activate credits?",
    credit: 10000,
    label: "AWS Activate",
  },
  {
    id: 3,
    question: "Have you received Microsoft for Startups credits?",
    credit: 5000,
    label: "Microsoft for Startups",
  },
];

const PERKS = [
  {
    title: "Google Cloud for Startups",
    amount: "$2,000",
    steps: [
      "Go to cloud.google.com/startup",
      "Apply with your startup email",
      "Receive $2,000 in credits within 3-5 business days",
    ],
    note: "Credits valid for 12 months",
  },
  {
    title: "AWS Activate",
    amount: "$10,000",
    steps: [
      "Visit aws.amazon.com/activate",
      "Complete the Activate application (portfolio companies eligible for $10k)",
      "Credits applied to your AWS account within 2 weeks",
    ],
    note: "Requires active AWS account",
  },
  {
    title: "Microsoft for Startups",
    amount: "$5,000",
    steps: [
      "Apply at microsoft.com/en-us/startups",
      "Get accepted into the Founders Hub",
      "Receive up to $5,000 in Azure credits + GitHub Copilot + other benefits",
    ],
    note: "Must have an active product/prototype",
  },
];

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showPerks, setShowPerks] = useState(false);
  const [openPerks, setOpenPerks] = useState<Record<number, boolean>>({});

  const handleSelectAnswer = (answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: answer }));
  };

  const handleNext = () => {
    if (currentStep < CREDIT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const togglePerk = (idx: number) => {
    setOpenPerks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const total = CREDIT_QUESTIONS.reduce((sum, q, idx) => {
    return answers[idx] === true ? sum + q.credit : sum;
  }, 0);

  const cashAmount = Math.floor(total * 0.3);
  const progressPercent = isFinished
    ? 100
    : Math.round((currentStep / CREDIT_QUESTIONS.length) * 100);

  if (isFinished) {
    if (total === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="step-card"
        >
          <div className="mb-6">
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-3">
            You may still have credits available
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Many startups qualify for cloud credits they haven't claimed yet.
          </p>
          <p className="text-[var(--color-text-muted)] mb-8">
            Even if you haven't received credits from Google, AWS, or Microsoft,
            you may still be eligible. Reach out and we'll help you figure it out.
          </p>

          <a
            href="mailto:support@pevzner.pro"
            className="btn-primary inline-flex items-center gap-2"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </a>

          <p className="mt-10 text-sm text-[var(--color-text-muted)]">
            Have unused cloud credits? Write to us:{" "}
            <a
              href="mailto:support@pevzner.pro"
              className="text-[var(--color-accent-orange)] hover:underline"
            >
              support@pevzner.pro
            </a>
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="step-card"
      >
        <div className="mb-6">
          <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-3">
          You can claim up to{" "}
          <span className="text-[var(--color-accent-orange)]">
            {formatCurrency(total)}
          </span>{" "}
          in cloud startup credits
        </h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          Based on your answers, here's what you're eligible for.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Option 1: Get AI Model Credits */}
          <div className="p-5 rounded-xl border border-[var(--color-glass-border)] bg-[rgba(255,255,255,0.03)]">
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Claim your {formatCurrency(total)} in cloud credits and use them
              for AI models
            </p>
            <button
              onClick={() => setShowPerks(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Get Instructions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Get Cash */}
          <div className="p-5 rounded-xl border border-[var(--color-glass-border)] bg-[rgba(255,255,255,0.03)]">
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Receive up to{" "}
              <span className="text-white font-medium">
                {formatCurrency(cashAmount)}
              </span>{" "}
              in cash by sharing your account access with us
            </p>
            <a
              href="mailto:support@pevzner.pro"
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              Get Cash
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Perk Cards */}
        <AnimatePresence>
          {showPerks && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mb-8"
            >
              {PERKS.map((perk, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--color-glass-border)] bg-[rgba(255,255,255,0.03)] overflow-hidden"
                >
                  <button
                    onClick={() => togglePerk(idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <span className="font-semibold">
                      {perk.title}{" "}
                      <span className="text-[var(--color-accent-orange)] font-normal">
                        {perk.amount}
                      </span>
                    </span>
                    {openPerks[idx] ? (
                      <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openPerks[idx] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <ol className="space-y-2 mb-3">
                            {perk.steps.map((step, sIdx) => (
                              <li
                                key={sIdx}
                                className="flex gap-3 text-sm text-[var(--color-text-muted)]"
                              >
                                <span className="text-[var(--color-accent-blue)] font-medium shrink-0">
                                  {sIdx + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                          <div className="font-mono text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-[var(--color-text-muted)]">
                            📌 {perk.note}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <hr className="border-[var(--color-glass-border)] mb-6" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Have unused cloud credits you're not using? Write to us:{" "}
          <a
            href="mailto:support@pevzner.pro"
            className="text-[var(--color-accent-orange)] hover:underline"
          >
            support@pevzner.pro
          </a>
        </p>
      </motion.div>
    );
  }

  const activeQuestion = CREDIT_QUESTIONS[currentStep];
  const currentAnswer = answers[currentStep];

  return (
    <div className="step-card">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-medium text-[var(--color-accent-blue)]">
            Question {currentStep + 1} of {CREDIT_QUESTIONS.length}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            {progressPercent}% complete
          </span>
        </div>
        <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
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

          <div className="grid grid-cols-2 gap-3 mb-8">
            {(["Yes", "No"] as const).map((label) => {
              const value = label === "Yes";
              const isSelected = currentAnswer === value;
              return (
                <button
                  key={label}
                  onClick={() => handleSelectAnswer(value)}
                  className={`w-full p-4 rounded-xl border text-center font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-[rgba(139,92,246,0.1)] border-[var(--color-accent-purple)] text-white"
                      : "bg-[rgba(255,255,255,0.03)] border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={currentAnswer === undefined || currentAnswer === null}
              className={`btn-primary flex items-center gap-2 ${
                currentAnswer === undefined || currentAnswer === null
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {currentStep === CREDIT_QUESTIONS.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
