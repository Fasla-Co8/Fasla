export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type QType =
  | "mcq"
  | "fill"
  | "match"
  | "order"
  | "error"
  | "scramble"
  | "writing"
  | "listening";
export type Skill = "grammar" | "vocabulary" | "reading" | "writing" | "listening" | "structure";

export type PublicQuestion = {
  id: string;
  level: Level;
  type: QType;
  skill: Skill;
  stem: string;
  seconds: number;
  options?: { id: string; text: string }[];
  left?: { id: string; text: string }[];
  right?: { id: string; text: string }[];
  tokens?: { id: string; text: string }[];
  words?: { index: number; text: string }[];
  letters?: { id: string; char: string }[];
  requiredWord?: string;
  minWords?: number;
  listenText?: string;
};

export type AnswerValue =
  | { type: "mcq"; optionId: string }
  | { type: "fill"; text: string }
  | { type: "match"; pairs: Record<string, string> }
  | { type: "order"; tokens: string[] }
  | { type: "error"; index: number | null }
  | { type: "scramble"; text: string }
  | { type: "writing"; text: string }
  | { type: "listening"; text: string };

export type Presentation = {
  letters?: { id: string; char: string }[];
  tokens?: { id: string; text: string }[];
  right?: { id: string; text: string }[];
};

export function secondsFor(type: QType) {
  return type === "writing" || type === "listening" ? 180 : 60;
}

export function emptyAnswer(type: QType): AnswerValue {
  switch (type) {
    case "mcq":
      return { type: "mcq", optionId: "" };
    case "fill":
      return { type: "fill", text: "" };
    case "match":
      return { type: "match", pairs: {} };
    case "order":
      return { type: "order", tokens: [] };
    case "error":
      return { type: "error", index: null };
    case "scramble":
      return { type: "scramble", text: "" };
    case "writing":
      return { type: "writing", text: "" };
    case "listening":
      return { type: "listening", text: "" };
  }
}

export const LEVEL_POINTS: Record<Level, number> = {
  A1: 1,
  A2: 1.5,
  B1: 2,
  B2: 2.5,
  C1: 3,
};
