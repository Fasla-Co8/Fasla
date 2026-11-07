"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaslaLogo } from "@/components/Logo";
import { QuestionCard } from "@/components/QuestionCard";
import { LanguageSwitch } from "@/components/SiteChrome";
import { useI18n } from "@/components/LanguageProvider";
import { emptyAnswer, type AnswerValue, type PublicQuestion } from "@/lib/assessment/types";

type RunnerState = {
  status: "in_progress" | "completed";
  question: PublicQuestion | null;
  draft: AnswerValue | null;
  finished: boolean;
  remainingSeconds: number;
  total: number;
  attempt: { currentIndex: number; fullName: string };
};

export function TestRunner({ token }: { token: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<RunnerState | null>(null);
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const answerRef = useRef<AnswerValue | null>(null);
  const lock = useRef(false);
  const started = useRef(Date.now());
  const baseRemaining = useRef(0);
  const timedOutSent = useRef(false);
  const skipSave = useRef(true);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  function apply(next: RunnerState) {
    if (next.status === "completed") {
      window.location.href = `/placement/results/${token}`;
      return;
    }
    setState(next);
    const fresh = next.draft ?? (next.question ? emptyAnswer(next.question.type) : null);
    skipSave.current = true;
    setAnswer(fresh);
    answerRef.current = fresh;
    setRemaining(next.remainingSeconds);
    baseRemaining.current = next.remainingSeconds;
    started.current = Date.now();
    timedOutSent.current = false;
  }

  async function load() {
    const response = await fetch(`/api/placement/${token}`);
    const data = (await response.json()) as { state?: RunnerState; error?: string };
    if (!data.state) {
      setError(data.error || t.common.error);
      return;
    }
    apply(data.state);
  }

  useEffect(() => {
    void load();
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function persist(advance: boolean, timedOut = false) {
    if (!state?.question || lock.current) return;
    lock.current = true;
    setNote(t.placement.saving);
    const response = await fetch("/api/placement/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        questionId: state.question.id,
        answer: answerRef.current,
        advance,
        expectedIndex: state.attempt.currentIndex,
        timedOut,
      }),
    });
    const data = (await response.json()) as { state?: RunnerState; error?: string };
    lock.current = false;
    if (!data.state) {
      setError(data.error || t.common.error);
      return;
    }
    setNote(t.placement.saved);
    apply(data.state);
  }

  useEffect(() => {
    if (!state?.question || state.finished) return;
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      const next = Math.max(0, baseRemaining.current - elapsed);
      setRemaining(next);
      if (next === 0 && !timedOutSent.current) {
        timedOutSent.current = true;
        setNote(t.placement.timeout);
        void persist(true, true);
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.question?.id, state?.attempt.currentIndex]);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    if (!state?.question || state.finished) return;
    const id = window.setTimeout(() => {
      void persist(false);
    }, 700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  async function submitFinal() {
    const response = await fetch("/api/placement/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (response.ok) window.location.href = `/placement/results/${token}`;
    else setError(t.common.error);
  }

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const progress = state ? Math.min(100, Math.round((state.attempt.currentIndex / state.total) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="w-12 sm:w-14"><FaslaLogo variant="light" /></div>
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <div className={`font-display text-2xl font-bold ${remaining <= 10 ? "text-cta" : ""}`}>{clock}</div>
          </div>
        </div>
        <div className="h-1 bg-white/15"><div className="h-1 bg-cta" style={{ width: `${progress}%` }} /></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {error ? <p className="mb-4 border border-red-200 bg-white p-3 text-sm text-red-700">{error}</p> : null}
        {!state ? <p>{t.common.loading}</p> : null}
        {state?.finished ? (
          <section className="bg-white p-6">
            <h1 className="font-display text-3xl font-bold text-navy">{t.placement.submitReady}</h1>
            <button type="button" onClick={submitFinal} className="mt-6 bg-cta px-5 py-3 font-semibold text-navy">{t.placement.submit}</button>
          </section>
        ) : null}
        {state?.question && !state.finished ? (
          <section className="bg-white p-6">
            <div className="mb-4 flex items-center justify-between text-sm text-black/55">
              <span>{t.placement.progress}: {state.attempt.currentIndex + 1} / {state.total}</span>
              <span>{note || t.placement.time}</span>
            </div>
            <QuestionCard question={state.question} value={answer} onChange={setAnswer} />
            <button type="button" onClick={() => persist(true)} className="mt-6 bg-navy px-5 py-3 text-sm font-semibold text-white">{t.placement.next}</button>
          </section>
        ) : null}
        <Link href="/placement" className="mt-6 inline-block text-sm text-brand">{t.placement.exit}</Link>
      </main>
    </div>
  );
}
