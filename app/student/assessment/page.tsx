"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

const questions: Question[] = [
  {
    id: 1,
    question: "Which concept best describes React's component model?",
    options: [
      "Reusable UI building blocks",
      "Database tables",
      "HTTP routing",
      "Operating system processes",
    ],
    answer: "Reusable UI building blocks",
  },
  {
    id: 2,
    question: "Which technology is commonly used to interact with PostgreSQL from a Node.js application?",
    options: [
      "Prisma",
      "Tailwind CSS",
      "Cloudinary",
      "Clerk",
    ],
    answer: "Prisma",
  },
  {
    id: 3,
    question: "What does REST primarily define?",
    options: [
      "A style for designing network APIs",
      "A CSS framework",
      "A database engine",
      "A programming language",
    ],
    answer: "A style for designing network APIs",
  },
  {
    id: 4,
    question: "Which HTTP method is normally used to retrieve data?",
    options: ["POST", "GET", "DELETE", "PATCH"],
    answer: "GET",
  },
  {
    id: 5,
    question: "What is the primary purpose of authentication?",
    options: [
      "Determine who a user is",
      "Compress images",
      "Style a webpage",
      "Sort database rows",
    ],
    answer: "Determine who a user is",
  },
];

export default function AssessmentPage() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const question = questions[currentQuestion];

  function selectAnswer(answer: string) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    } else {
      setSubmitted(true);
    }
  }

  function calculateScore() {
    return questions.filter(
      (item) => answers[item.id] === item.answer
    ).length;
  }

  if (submitted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-3xl space-y-8">
          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="text-sm text-[#9AA3C0] hover:text-[#C7CCE0]"
          >
            ← Back to dashboard
          </button>

          <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/70 p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2BA792]/10 text-3xl font-bold text-[#2BA792]">
              {percentage}%
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Assessment Complete
            </h1>

            <p className="mt-3 text-[#9AA3C0]">
              You answered {score} out of {questions.length} questions
              correctly.
            </p>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#2BA792]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="rounded-xl border border-[#232B47] px-5 py-3 text-sm font-semibold text-[#C7CCE0] hover:bg-white/5"
              >
                Retake Assessment
              </button>

              <button
                type="button"
                onClick={() => router.push("/student/gaps")}
                className="rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526] hover:bg-[#f6bd6a]"
              >
                View Skill Gaps
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const selectedAnswer = answers[question.id];
  const progress = Math.round(
    ((currentQuestion + 1) / questions.length) * 100
  );

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-3xl space-y-8">
        <button
          type="button"
          onClick={() => router.push("/student/dashboard")}
          className="text-sm text-[#9AA3C0] hover:text-[#C7CCE0]"
        >
          ← Back to dashboard
        </button>

        <section>
          <p className="text-sm font-medium text-[#2BA792]">
            SkillSetu Assessment
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Test Your Technical Skills
          </h1>

          <p className="mt-2 text-[#9AA3C0]">
            Assess your current knowledge and strengthen your skill
            profile.
          </p>
        </section>

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/70 p-7">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9AA3C0]">
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span className="text-[#C7CCE0]">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#2BA792] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold leading-8">
              {question.question}
            </h2>

            <div className="mt-6 space-y-3">
              {question.options.map((option) => {
                const selected = selectedAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(option)}
                    className={`w-full rounded-xl border p-4 text-left text-sm transition ${
                      selected
                        ? "border-[#2BA792] bg-[#2BA792]/10 text-[#6fd6c4]"
                        : "border-[#232B47] bg-[#0F1526]/40 text-[#C7CCE0] hover:border-[#5B6488]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                          selected
                            ? "border-[#2BA792] bg-[#2BA792] text-[#0F1526]"
                            : "border-[#5B6488]"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>

                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={nextQuestion}
              className="rounded-xl bg-[#F4A93B] px-6 py-3 text-sm font-semibold text-[#0F1526] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentQuestion === questions.length - 1
                ? "Submit Assessment"
                : "Next Question →"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}