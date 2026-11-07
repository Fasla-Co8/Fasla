"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { emptyAnswer, type AnswerValue, type PublicQuestion } from "@/lib/assessment/types";

export function QuestionCard({
  question,
  value,
  onChange,
  disabled = false,
}: {
  question: PublicQuestion;
  value: AnswerValue | null;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const answer = value && value.type === question.type ? value : emptyAnswer(question.type);
  const [plays, setPlays] = useState(3);
  const [audioError, setAudioError] = useState("");

  useEffect(() => {
    setPlays(3);
    setAudioError("");
  }, [question.id]);

  function play() {
    if (!question.listenText || plays <= 0) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setAudioError(t.placement.noAudio);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.listenText);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
    setPlays((count) => count - 1);
  }

  const instruction = t.q[question.type];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{question.level} · {t.skills[question.skill]}</p>
      <p className="mt-2 text-sm text-black/60">{instruction}</p>
      <h3 className="mt-3 font-display text-2xl font-bold leading-snug">{question.stem}</h3>

      {question.type === "mcq" && answer.type === "mcq" ? (
        <div className="mt-5 grid gap-2">
          {question.options?.map((option) => (
            <label key={option.id} className={`flex cursor-pointer items-start gap-3 border px-4 py-3 ${answer.optionId === option.id ? "border-navy bg-navy text-white" : "border-black/10"}`}>
              <input type="radio" className="mt-1" name={question.id} checked={answer.optionId === option.id} disabled={disabled} onChange={() => onChange({ type: "mcq", optionId: option.id })} />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      ) : null}

      {question.type === "fill" && answer.type === "fill" ? (
        <input className="field mt-5" value={answer.text} disabled={disabled} onChange={(event) => onChange({ type: "fill", text: event.target.value })} />
      ) : null}

      {question.type === "match" && answer.type === "match" ? (
        <div className="mt-5 grid gap-3">
          {question.left?.map((item) => (
            <label key={item.id} className="grid gap-2 border border-black/10 p-3 sm:grid-cols-[1fr_1fr] sm:items-center">
              <span className="font-semibold">{item.text}</span>
              <select className="field" value={answer.pairs[item.id] ?? ""} disabled={disabled} onChange={(event) => onChange({ type: "match", pairs: { ...answer.pairs, [item.id]: event.target.value } })}>
                <option value="">{t.q.chooseMatch}</option>
                {question.right?.map((right) => (
                  <option key={right.id} value={right.id}>{right.text}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {question.type === "order" && answer.type === "order" ? (
        <div className="mt-5">
          <p className="text-sm font-semibold">{t.q.sentence}</p>
          <div className="mt-2 min-h-14 border border-black/10 p-3">
            {answer.tokens.length ? answer.tokens.join(" ") : "—"}
          </div>
          <p className="mt-4 text-sm font-semibold">{t.q.bank}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {question.tokens?.filter((token) => !answer.tokens.includes(token.text) || answer.tokens.filter((item) => item === token.text).length < (question.tokens?.filter((item) => item.text === token.text).length ?? 0)).map((token) => (
              <button key={token.id} type="button" disabled={disabled} className="border border-navy px-3 py-2 text-sm font-semibold" onClick={() => onChange({ type: "order", tokens: [...answer.tokens, token.text] })}>
                {token.text}
              </button>
            ))}
          </div>
          {answer.tokens.length ? (
            <button type="button" className="mt-3 text-sm underline" disabled={disabled} onClick={() => onChange({ type: "order", tokens: answer.tokens.slice(0, -1) })}>
              {t.challenge.back}
            </button>
          ) : null}
        </div>
      ) : null}

      {question.type === "error" && answer.type === "error" ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {question.words?.map((word) => (
            <button key={word.index} type="button" disabled={disabled} onClick={() => onChange({ type: "error", index: word.index })} className={`border px-3 py-2 text-sm font-semibold ${answer.index === word.index ? "border-navy bg-navy text-white" : "border-black/10"}`}>
              {word.text}
            </button>
          ))}
        </div>
      ) : null}

      {question.type === "scramble" && answer.type === "scramble" ? (
        <div className="mt-5">
          <div className="min-h-12 border border-black/10 p-3 text-lg font-semibold tracking-[0.2em]">{answer.text || "—"}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {question.letters?.map((letter) => (
              <button key={letter.id} type="button" disabled={disabled} className="border border-navy px-3 py-2 font-semibold" onClick={() => onChange({ type: "scramble", text: `${answer.text}${letter.char}` })}>
                {letter.char}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            <button type="button" className="text-sm underline" disabled={disabled} onClick={() => onChange({ type: "scramble", text: answer.text.slice(0, -1) })}>{t.challenge.back}</button>
            <button type="button" className="text-sm underline" disabled={disabled} onClick={() => onChange({ type: "scramble", text: "" })}>{t.q.clear}</button>
          </div>
          <input className="field mt-3" value={answer.text} disabled={disabled} onChange={(event) => onChange({ type: "scramble", text: event.target.value.toUpperCase() })} />
        </div>
      ) : null}

      {(question.type === "writing" || question.type === "listening") && (answer.type === "writing" || answer.type === "listening") ? (
        <div className="mt-5">
          {question.requiredWord ? <p className="text-sm font-semibold">{t.q.required}: {question.requiredWord}</p> : null}
          {question.type === "listening" ? (
            <div className="mb-3 flex items-center gap-3">
              <button type="button" onClick={play} disabled={disabled || plays <= 0} className="bg-navy px-4 py-3 text-sm font-semibold text-white">{t.placement.play}</button>
              <span className="text-sm">{t.placement.plays}: {plays}</span>
            </div>
          ) : null}
          {audioError ? <p className="mb-3 text-sm">{audioError}</p> : null}
          <textarea className="field min-h-32" value={answer.text} disabled={disabled} onChange={(event) => onChange(question.type === "writing" ? { type: "writing", text: event.target.value } : { type: "listening", text: event.target.value })} />
          <p className="mt-2 text-xs text-black/50">{answer.text.trim() ? answer.text.trim().split(/\s+/).length : 0} {t.placement.wordCount}</p>
        </div>
      ) : null}
    </div>
  );
}
