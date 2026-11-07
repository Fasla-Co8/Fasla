"use client";

import { useId } from "react";

// Vector transcription of the supplied FASLA reference: the comma above the
// wordmark, FASL, a short vertical rope and knot, and the suspended lowercase a.
// The previous decorative rope loops are intentionally not part of this mark.
const COMMA_PATH =
  "M259 2C301 2 329 38 329 83C329 146 280 206 203 238L187 218C234 192 262 162 264 125C220 130 185 111 185 70C185 31 217 2 259 2Z";

const ROPE_STRANDS = [
  "M323 383C312 388 313 402 318 417L327 452",
  "M331 383C340 400 331 425 334 452",
  "M338 470C347 462 359 456 359 444",
  "M330 500C326 516 335 532 330 550",
];

const KNOT_COILS = [
  "M314 456C324 451 339 451 348 457",
  "M313 465C325 459 340 458 350 464",
  "M313 474C325 468 341 467 350 473",
  "M314 483C326 477 341 476 349 482",
  "M315 492C326 486 340 485 348 491",
  "M317 501C327 495 339 494 346 499",
];

export function FaslaLogo({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ink = variant === "light" ? "#FFFFFF" : "#082B59";
  const ropeGradient = `${id}-rope-gold`;
  const ropeTexture = `${id}-rope-twist`;
  const ropeShadow = `${id}-rope-shadow`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 638"
      fill="none"
      role="img"
      aria-label="FASLA"
      className={`fasla-logo ${className}`}
      style={{ direction: "ltr" }}
    >
      <title>FASLA</title>
      <defs>
        <linearGradient id={ropeGradient} x1="312" y1="420" x2="351" y2="425" gradientUnits="userSpaceOnUse">
          <stop stopColor="#80572C" />
          <stop offset=".24" stopColor="#C49A5D" />
          <stop offset=".48" stopColor="#E2BF83" />
          <stop offset=".72" stopColor="#B88B4A" />
          <stop offset="1" stopColor="#795027" />
        </linearGradient>
        <pattern id={ropeTexture} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <rect width="7" height="7" fill={`url(#${ropeGradient})`} />
          <path d="M0 1H7" stroke="#70491F" strokeWidth="1.4" opacity=".7" />
          <path d="M0 3H7" stroke="#F0D7A8" strokeWidth="1" opacity=".75" />
        </pattern>
        <filter id={ropeShadow} x="-30%" y="-15%" width="170%" height="140%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity=".28" />
        </filter>
      </defs>

      <path d={COMMA_PATH} fill={ink} />

      <g fill={ink} aria-hidden="true">
        <path d="M4 281H134V311H41V338H120V368H41V416H4Z" />
        <path
          fillRule="evenodd"
          d="M160 283H201L254 416H215L205 386H143L133 416H95L160 283ZM155 358H194L175 308L155 358Z"
        />
        <path d="M378 294L363 322C348 311 335 307 321 307C306 307 297 314 297 324C297 334 305 338 328 344C366 353 385 363 385 384C385 406 364 418 329 418C301 418 277 410 259 396L275 368C292 381 309 388 329 388C343 388 351 384 351 377C351 370 344 367 323 361C285 352 263 343 263 320C263 295 286 279 321 279C344 279 363 284 378 294Z" />
        <path d="M401 282H437V383H495V416H401V282Z" />
        <g transform="rotate(-4 320 575)">
          <path
            fillRule="evenodd"
            d="M322 520C357 520 377 538 377 568V625H350L347 612C338 623 324 629 306 629C278 629 260 613 260 590C260 566 279 552 310 552H347V548C347 536 337 529 321 529C306 529 293 534 281 541L272 535C286 525 304 520 322 520ZM312 572C296 572 288 579 288 590C288 601 297 608 312 608C332 608 347 597 347 580V572H312Z"
          />
        </g>
      </g>

      <g filter={`url(#${ropeShadow})`} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ROPE_STRANDS.map((path) => (
          <g key={path}>
            <path d={path} stroke="#65421F" strokeWidth="16" />
            <path d={path} stroke={`url(#${ropeGradient})`} strokeWidth="12" />
            <path d={path} stroke={`url(#${ropeTexture})`} strokeWidth="11" />
          </g>
        ))}
        <path d="M316 451C324 446 342 448 348 456L347 502C339 511 322 510 315 501Z" fill={`url(#${ropeGradient})`} />
        {KNOT_COILS.map((path) => (
          <g key={path}>
            <path d={path} stroke="#65421F" strokeWidth="10" />
            <path d={path} stroke={`url(#${ropeGradient})`} strokeWidth="7" />
            <path d={path} stroke={`url(#${ropeTexture})`} strokeWidth="6" />
          </g>
        ))}
        <g strokeWidth="1.5">
          <path d="M356 446L354 439M359 445L360 437M362 446L366 441" stroke="#D2AE75" />
          <path d="M326 548L324 554M330 549L330 556M334 548L336 553" stroke="#D2AE75" />
        </g>
      </g>
    </svg>
  );
}

export function RopeRule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 14" className={`h-3 w-28 ${className}`} aria-hidden="true">
      <path d="M4 7h132" stroke="#B88B4A" strokeWidth="3" strokeLinecap="round" />
      <path d="M4 7h132" stroke="#F8E7C8" strokeWidth="1.3" strokeDasharray="5 7" />
    </svg>
  );
}
