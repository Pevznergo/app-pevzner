"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import { saveQuizAnswers } from "@/app/actions/saveQuiz";
import Script from "next/script";

const SELL_RATE = 0.3;

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

type Step = { text: string; url?: string; urlText?: string };
type Perk = { title: string; amount: string; steps: Step[]; note: string };

const NVIDIA_PREREQ_STEPS: Step[] = [
  {
    text: "Apply at nvidia.com/en-us/startups/join",
    url: "https://www.nvidia.com/en-us/startups/join/",
    urlText: "nvidia.com/en-us/startups/join",
  },
  { text: "Describe your AI product + GPU needs" },
  { text: "Wait 2-4 weeks for approval email" },
];

const PERKS: Perk[] = [
  {
    title: "Google Cloud for Startups",
    amount: "$2,000",
    steps: [
      {
        text: 'Log into NVIDIA Inception portal → go to "Benefits" → copy your Google Cloud Partner Code',
      },
      {
        text: 'Go to cloud.google.com/startup → click "Apply" → choose "Start" package',
        url: "https://cloud.google.com/startup",
        urlText: "cloud.google.com/startup",
      },
      {
        text: 'Select "NVIDIA Inception" as your partner program → paste your code',
      },
      { text: "Link your billing account ($1 hold for verification)" },
    ],
    note: "Credits activate in 3-5 business days. Valid 12 months. Includes Google Cloud training.",
  },
  {
    title: "AWS Activate",
    amount: "$10,000",
    steps: [
      {
        text: 'Log into NVIDIA Inception portal → go to "Benefits" → copy your AWS Organization ID',
      },
      {
        text: 'Go to aws.amazon.com/activate → click "Apply for AWS Activate" → select "Activate Portfolio"',
        url: "https://aws.amazon.com/activate",
        urlText: "aws.amazon.com/activate",
      },
      {
        text: "Paste your Organization ID + your 12-digit AWS Account ID (same email + website)",
      },
      { text: "Mention NVIDIA Inception membership in the description field" },
    ],
    note: "Approval 7-14 days. Credits valid 2 years. Includes $1,500 in support credits.",
  },
  {
    title: "Microsoft for Startups",
    amount: "$5,000",
    steps: [
      {
        text: 'Log into NVIDIA Inception portal → go to "Benefits" → find your Microsoft Referral Code',
      },
      {
        text: "Go to foundershub.startups.microsoft.com → log in with your Microsoft account",
        url: "https://foundershub.startups.microsoft.com",
        urlText: "foundershub.startups.microsoft.com",
      },
      {
        text: "Select NVIDIA Inception as your partner → describe your MVP + add a demo video link",
      },
      {
        text: "Complete Business Verification to unlock $5,000 Level 2 tier",
      },
    ],
    note: "Approval ~3 days. Credits valid 180 days. Includes GitHub Enterprise + M365 + priority Azure OpenAI.",
  },
];

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

function renderStep(step: Step) {
  if (!step.url || !step.urlText) {
    return <span>{step.text}</span>;
  }
  const parts = step.text.split(step.urlText);
  if (parts.length !== 2) {
    return <span>{step.text}</span>;
  }
  return (
    <span>
      {parts[0]}
      <a
        href={step.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent-blue)] hover:underline"
      >
        {step.urlText}
      </a>
      {parts[1]}
    </span>
  );
}

export default function Quiz({
  hasCompletedQuiz = false,
}: {
  hasCompletedQuiz?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [isFinished, setIsFinished] = useState(hasCompletedQuiz);
  const [openPerks, setOpenPerks] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });

  const handleSelectAnswer = (answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: answer }));
  };

  const handleNext = () => {
    if (currentStep < CREDIT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
      saveQuizAnswers(answers).catch(console.error);
    }
  };

  const retakeQuiz = () => {
    setIsFinished(false);
    setCurrentStep(0);
    setAnswers({});
    setOpenPerks({ 0: true, 1: true, 2: true });
  };

  const togglePerk = (idx: number) => {
    setOpenPerks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const progressPercent = isFinished
    ? 100
    : Math.round((currentStep / CREDIT_QUESTIONS.length) * 100);

  if (isFinished) {
    const yesCreditIndices = [0, 1, 2].filter((i) => answers[i] === true);
    const noCreditIndices = [0, 1, 2].filter((i) => answers[i] !== true);
    const yesCreditTotal = yesCreditIndices.reduce(
      (sum, i) => sum + CREDIT_QUESTIONS[i].credit,
      0
    );
    const noCreditTotal = noCreditIndices.reduce(
      (sum, i) => sum + CREDIT_QUESTIONS[i].credit,
      0
    );
    const cashAmount = Math.floor(yesCreditTotal * SELL_RATE);

    const isAllYes = yesCreditIndices.length === 3;
    const isAllNo = noCreditIndices.length === 3;
    const isMixed = !isAllYes && !isAllNo;

    const headline =
      isAllYes ? (
        <>
          You have{" "}
          <span className="text-[var(--color-accent-orange)]">
            {formatCurrency(yesCreditTotal)}
          </span>{" "}
          in credits
        </>
      ) : isAllNo ? (
        <>
          You can claim{" "}
          <span className="text-[var(--color-accent-orange)]">
            {formatCurrency(noCreditTotal)}
          </span>{" "}
          in credits for free
        </>
      ) : (
        <>
          You have{" "}
          <span className="text-[var(--color-accent-orange)]">
            {formatCurrency(yesCreditTotal)}
          </span>{" "}
          in credits and can claim{" "}
          <span className="text-[var(--color-accent-orange)]">
            {formatCurrency(noCreditTotal)}
          </span>{" "}
          more for free
        </>
      );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="step-card"
      >
        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-8">{headline}</h2>

        {/* Section 1: Credits you already have */}
        {yesCreditIndices.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-1">
              Credits you already have
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              We can buy these from you — you get cash, they get used
              productively.
            </p>

            <div className="rounded-xl border border-[var(--color-glass-border)] bg-[rgba(255,255,255,0.03)] overflow-hidden mb-4">
              <div className="flex justify-between px-4 py-2 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-glass-border)]">
                <span>Credit</span>
                <span>Face value</span>
              </div>
              {yesCreditIndices.map((i) => (
                <div
                  key={i}
                  className="flex justify-between px-4 py-3 border-b border-[var(--color-glass-border)] last:border-0"
                >
                  <span className="font-medium">{CREDIT_QUESTIONS[i].label}</span>
                  <span className="text-[var(--color-accent-orange)]">
                    {formatCurrency(CREDIT_QUESTIONS[i].credit)}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="mailto:justin.reed@pevzner.pro"
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              Get {formatCurrency(cashAmount)} in cash
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="text-sm text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-xl p-4">
              How it works: You already own these credits — they were free to
              you. We pay you 30% of face value in cash. You add us to your
              cloud account as a billing admin for one month. That&apos;s it.
              Credits expire unused otherwise.
            </div>

            {isAllYes && (
              <button
                onClick={retakeQuiz}
                className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors underline"
              >
                I want to claim more credits
              </button>
            )}
          </div>
        )}

        {/* Section 2: Credits you can claim for free */}
        {noCreditIndices.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-1">
              Credits you can claim for free
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              These are real startup programs. It takes ~15 minutes per credit.
            </p>

            {/* NVIDIA Inception prerequisite block */}
            <div className="rounded-xl border border-[rgba(99,200,100,0.25)] bg-[rgba(99,200,100,0.05)] p-4 mb-4">
              <p className="font-semibold text-sm mb-3">
                First: Join NVIDIA Inception (required for all 3 credits)
              </p>
              <ol className="space-y-2 mb-3">
                {NVIDIA_PREREQ_STEPS.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm text-[var(--color-text-muted)]"
                  >
                    <span className="text-[var(--color-accent-blue)] font-medium shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{renderStep(step)}</span>
                  </li>
                ))}
              </ol>
              <div className="font-mono text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-[var(--color-text-muted)]">
                📌 Free program. Your NVIDIA membership unlocks all 3.
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Once approved, claim each credit:
            </p>

            {/* Per-credit cards (only for No answers) */}
            <div className="space-y-3">
              {noCreditIndices.map((i) => {
                const perk = PERKS[i];
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--color-glass-border)] bg-[rgba(255,255,255,0.03)] overflow-hidden"
                  >
                    <button
                      onClick={() => togglePerk(i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                    >
                      <span className="font-semibold">
                        {perk.title}{" "}
                        <span className="text-[var(--color-accent-orange)] font-normal">
                          {perk.amount}
                        </span>
                      </span>
                      {openPerks[i] ? (
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openPerks[i] && (
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
                                  <span>{renderStep(step)}</span>
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
                );
              })}
            </div>
          </div>
        )}

        {/* Retake affordance */}
        {(isMixed || isAllNo) && (
          <div className="mb-6">
            <button
              onClick={retakeQuiz}
              className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors underline"
            >
              Retake quiz
            </button>
          </div>
        )}

        <hr className="border-[var(--color-glass-border)] mb-6" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Have unused cloud credits you&apos;re not using? Write to us:{" "}
          <a
            href="mailto:justin.reed@pevzner.pro"
            className="text-[var(--color-accent-orange)] hover:underline"
          >
            support@pevzner.pro
          </a>
        </p>

        <Script id="bitrix-widget" strategy="lazyOnload">
          {`
            (function(w,d,u){
                    var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);
                    var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
            })(window,document,'https://cdn-ru.bitrix24.ru/b37389416/crm/site_button/loader_1_wsatm6.js');
          `}
        </Script>
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
              {currentStep === CREDIT_QUESTIONS.length - 1
                ? "See Results"
                : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
