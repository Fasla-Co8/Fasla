import type { Faq, Unit } from "@/lib/types";

const STEPS_EN = [
  "Core lesson",
  "Sound and form focus",
  "Guided examples",
  "Controlled practice",
  "Vocabulary builder",
  "Vocabulary in context",
  "Listening for gist",
  "Listening for detail",
  "Pronunciation drill",
  "Speaking pair task",
  "Role-play",
  "Reading spotlight",
  "Writing task",
  "Error correction clinic",
  "Grammar in real life",
  "Fluency booster",
  "Unit checkpoint",
];

const STEPS_AR = [
  "الدرس الأساسي",
  "التركيز على الصوت والصيغة",
  "أمثلة موجهة",
  "تدريب مضبوط",
  "بناء المفردات",
  "مفردات في سياق",
  "استماع للفكرة العامة",
  "استماع للتفاصيل",
  "تدريب النطق",
  "مهمة تحدث ثنائية",
  "لعب أدوار",
  "قراءة مركزة",
  "مهمة كتابة",
  "عيادة تصحيح الأخطاء",
  "قواعد في الحياة اليومية",
  "تعزيز الطلاقة",
  "مراجعة الوحدة",
];

function unit(titleEn: string, titleAr: string, count: number): Unit {
  return {
    titleEn,
    titleAr,
    objectiveEn: `Use ${titleEn.toLowerCase()} with confidence in study, work, and daily life.`,
    objectiveAr: `استخدام «${titleAr}» بثقة في الدراسة والعمل والحياة اليومية.`,
    lessons: Array.from({ length: count }, (_, index) => ({
      titleEn: `${titleEn} — ${STEPS_EN[index] ?? `Practice ${index + 1}`}`,
      titleAr: `${titleAr} — ${STEPS_AR[index] ?? `تدريب ${index + 1}`}`,
    })),
  };
}

function units(titles: [string, string][], counts: number[]) {
  return titles.map(([en, ar], index) => unit(en, ar, counts[index] ?? counts[counts.length - 1] ?? 8));
}

const sharedFaqs: Faq[] = [
  {
    qEn: "How do I pay?",
    qAr: "كيف أدفع الرسوم؟",
    aEn: "Registration on this website is a request, not a payment. FASLA confirms the fee and schedule with you on WhatsApp. No card payment is taken here.",
    aAr: "التسجيل في هذا الموقع طلب التحاق وليس عملية دفع. تؤكد FASLA الرسوم والموعد معك عبر واتساب. لا يُحصَّل أي دفع بالبطاقة هنا.",
  },
  {
    qEn: "Can my level change after the placement test?",
    qAr: "هل يمكن أن يتغير مستواي بعد اختبار تحديد المستوى؟",
    aEn: "Yes. The placement report recommends a starting course, and the academic team can adjust it after speaking with you.",
    aAr: "نعم. يوصي تقرير تحديد المستوى بدورة البداية، ويمكن للفريق الأكاديمي تعديله بعد الحديث معك.",
  },
  {
    qEn: "What if I miss a lesson?",
    qAr: "ماذا لو فاتني درس؟",
    aEn: "Each program includes guided review tasks. Tell the team on WhatsApp and they will point you to the missed unit before the next live session.",
    aAr: "يتضمن كل برنامج مهام مراجعة موجهة. أخبر الفريق عبر واتساب وسيوجهك إلى الوحدة الفائتة قبل اللقاء التالي.",
  },
];

export type CourseSeed = {
  slug: string;
  nameEn: string;
  nameAr: string;
  cefr: string;
  durationEn: string;
  durationAr: string;
  units: number;
  lessons: number;
  unitsLabelEn?: string | null;
  unitsLabelAr?: string | null;
  lessonsLabelEn?: string | null;
  lessonsLabelAr?: string | null;
  price: number | null;
  descriptionEn: string;
  descriptionAr: string;
  skillsEn: string[];
  skillsAr: string[];
  outcomesEn: string[];
  outcomesAr: string[];
  curriculum: { units: Unit[] };
  faqs: Faq[];
  contactPricing: boolean;
  sortOrder: number;
};

function course(input: CourseSeed): CourseSeed {
  const lessonCount = input.curriculum.units.reduce((sum, item) => sum + item.lessons.length, 0);
  if (input.curriculum.units.length !== input.units || lessonCount !== input.lessons) {
    throw new Error(`${input.slug} curriculum mismatch: ${input.curriculum.units.length} units / ${lessonCount} lessons`);
  }
  return input;
}

const a1Counts = Array(10).fill(17);
const a2Counts = [13, 13, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
const b1Counts = [10, 10, 10, 10, 10, ...Array(17).fill(9)];
const b2Counts = [...Array(17).fill(8), ...Array(13).fill(7)];

export const courseSeed: CourseSeed[] = [
  course({
    slug: "a1-beginner",
    nameEn: "A1 – Beginner",
    nameAr: "A1 – مبتدئ",
    cefr: "A1",
    durationEn: "40 Days",
    durationAr: "40 يومًا",
    units: 10,
    lessons: 170,
    price: 399.5,
    descriptionEn:
      "A complete beginner pathway from the first sound to the first real conversation. You build everyday vocabulary, essential grammar, and the confidence to introduce yourself, ask simple questions, and understand classroom English.",
    descriptionAr:
      "مسار كامل للمبتدئ من أول صوت إلى أول حوار حقيقي. تبني مفردات يومية وقواعد أساسية والثقة لتقديم نفسك وطرح أسئلة بسيطة وفهم إنجليزية الصف.",
    skillsEn: ["Alphabet and pronunciation", "Basic grammar", "Everyday vocabulary", "Simple speaking", "Listening for familiar words"],
    skillsAr: ["الحروف والنطق", "القواعد الأساسية", "مفردات يومية", "تحدث بسيط", "استماع للكلمات المألوفة"],
    outcomesEn: [
      "Introduce yourself and ask for basic information.",
      "Use the present simple for daily routines.",
      "Read and write short personal sentences.",
      "Understand slow, clear classroom English.",
    ],
    outcomesAr: [
      "تقديم نفسك وطلب معلومات أساسية.",
      "استخدام المضارع البسيط للروتين اليومي.",
      "قراءة وكتابة جمل شخصية قصيرة.",
      "فهم الإنجليزية الصفية الواضحة والبطيئة.",
    ],
    curriculum: {
      units: units(
        [
          ["The English Alphabet & Sounds", "الحروف والأصوات الإنجليزية"],
          ["Introducing Yourself", "تقديم نفسك"],
          ["Numbers, Time & Dates", "الأرقام والوقت والتواريخ"],
          ["Family & People", "العائلة والأشخاص"],
          ["Daily Routines", "الروتين اليومي"],
          ["Present Simple", "المضارع البسيط"],
          ["Places & There is / There are", "الأماكن و There is / There are"],
          ["Food & Shopping", "الطعام والتسوق"],
          ["Past Simple Foundations", "أساسيات الماضي البسيط"],
          ["Plans, Review & Real Talk", "الخطط والمراجعة والحوار الحقيقي"],
        ],
        a1Counts,
      ),
    },
    faqs: [
      ...sharedFaqs,
      {
        qEn: "Do I need any English before I start?",
        qAr: "هل أحتاج إلى أي إنجليزية قبل البداية؟",
        aEn: "No. A1 starts with sounds, letters, and classroom language.",
        aAr: "لا. يبدأ A1 بالأصوات والحروف ولغة الصف.",
      },
    ],
    contactPricing: false,
    sortOrder: 1,
  }),
  course({
    slug: "a2-elementary",
    nameEn: "A2 – Elementary",
    nameAr: "A2 – أساسي",
    cefr: "A2",
    durationEn: "60 Days",
    durationAr: "60 يومًا",
    units: 15,
    lessons: 185,
    price: 499,
    descriptionEn:
      "For learners who can use a few familiar phrases and now need connected grammar, past and future forms, and the language of travel, study, and daily problems.",
    descriptionAr:
      "لمن يستطيع استخدام عبارات مألوفة ويحتاج الآن إلى قواعد مترابطة وصيغ الماضي والمستقبل ولغة السفر والدراسة والمواقف اليومية.",
    skillsEn: ["Past and future forms", "Comparatives", "Short conversations", "Practical vocabulary", "Simple writing"],
    skillsAr: ["صيغ الماضي والمستقبل", "المقارنة", "حوارات قصيرة", "مفردات عملية", "كتابة بسيطة"],
    outcomesEn: [
      "Tell a short story in the past.",
      "Compare people, places, and choices.",
      "Handle travel, health, and study situations.",
      "Write a short message with a clear reason.",
    ],
    outcomesAr: [
      "سرد قصة قصيرة في الماضي.",
      "المقارنة بين الأشخاص والأماكن والاختيارات.",
      "التعامل مع مواقف السفر والصحة والدراسة.",
      "كتابة رسالة قصيرة بسبب واضح.",
    ],
    curriculum: {
      units: units(
        [
          ["Past Simple in Stories", "الماضي البسيط في القصص"],
          ["Comparatives & Superlatives", "المقارنة والتفضيل"],
          ["Countable & Uncountable Nouns", "الأسماء المعدودة وغير المعدودة"],
          ["Future with will & going to", "المستقبل بـ will و going to"],
          ["Present Perfect Introduction", "مقدمة المضارع التام"],
          ["Modals of Ability & Advice", "أفعال القدرة والنصيحة"],
          ["Prepositions of Time & Place", "حروف الجر للزمان والمكان"],
          ["Describing Experiences", "وصف التجارب"],
          ["Questions & Short Answers", "الأسئلة والإجابات القصيرة"],
          ["Connectors: and, but, because, so", "الروابط and و but و because و so"],
          ["Health & Lifestyle", "الصحة ونمط الحياة"],
          ["Travel & Directions", "السفر والاتجاهات"],
          ["Work & Study", "العمل والدراسة"],
          ["Adverbs of Frequency & Manner", "ظروف التكرار والكيفية"],
          ["A2 Review & Conversation", "مراجعة A2 والحوار"],
        ],
        a2Counts,
      ),
    },
    faqs: sharedFaqs,
    contactPricing: false,
    sortOrder: 2,
  }),
  course({
    slug: "b1-intermediate",
    nameEn: "B1 – Intermediate",
    nameAr: "B1 – متوسط",
    cefr: "B1",
    durationEn: "90 Days",
    durationAr: "90 يومًا",
    units: 22,
    lessons: 203,
    price: 598.5,
    descriptionEn:
      "A structured intermediate program for students who can survive in English and now want to explain opinions, tell longer stories, and write with control.",
    descriptionAr:
      "برنامج متوسط منظم للطلاب الذين يتدبرون أمورهم بالإنجليزية ويريدون الآن شرح الآراء وسرد قصص أطول والكتابة بسيطرة.",
    skillsEn: ["Narrative tenses", "Conditionals", "Opinion language", "Paragraph writing", "Listening for detail"],
    skillsAr: ["أزمنة السرد", "الجمل الشرطية", "لغة الرأي", "كتابة الفقرات", "الاستماع للتفاصيل"],
    outcomesEn: [
      "Explain reasons, results, and contrasts.",
      "Use the present perfect and narrative tenses accurately.",
      "Write a clear opinion paragraph.",
      "Follow the main points of a short talk.",
    ],
    outcomesAr: [
      "شرح الأسباب والنتائج والتباين.",
      "استخدام المضارع التام وأزمنة السرد بدقة.",
      "كتابة فقرة رأي واضحة.",
      "متابعة الأفكار الرئيسة في حديث قصير.",
    ],
    curriculum: {
      units: units(
        [
          ["Present Perfect vs Past Simple", "المضارع التام مقابل الماضي البسيط"],
          ["Past Continuous & Interruptions", "الماضي المستمر والمقاطعات"],
          ["Future Forms", "صيغ المستقبل"],
          ["Modals of Obligation", "أفعال الوجوب"],
          ["First Conditional", "الشرطي الأول"],
          ["Second Conditional", "الشرطي الثاني"],
          ["Gerunds & Infinitives", "أسماء الفاعل والمصادر"],
          ["Passive Voice Foundations", "أساسيات المبني للمجهول"],
          ["Relative Clauses", "جمل الوصل"],
          ["Reported Speech Basics", "أساسيات الكلام المنقول"],
          ["Used to & Would", "Used to و Would"],
          ["Comparatives in Argument", "المقارنة في الحجاج"],
          ["Articles in Depth", "أدوات التعريف بعمق"],
          ["Phrasal Verbs I", "الأفعال المركبة 1"],
          ["Opinion & Agreement", "الرأي والموافقة"],
          ["Narrative Tenses", "أزمنة السرد"],
          ["Problem-Solving Language", "لغة حل المشكلات"],
          ["Emails & Messages", "الرسائل الإلكترونية"],
          ["Academic Vocabulary Bridge", "جسر المفردات الأكاديمية"],
          ["Listening for Detail", "الاستماع للتفاصيل"],
          ["Speaking Fluency Labs", "مختبرات طلاقة التحدث"],
          ["B1 Mastery Review", "مراجعة إتقان B1"],
        ],
        b1Counts,
      ),
    },
    faqs: sharedFaqs,
    contactPricing: false,
    sortOrder: 3,
  }),
  course({
    slug: "b2-upper-intermediate",
    nameEn: "B2 – Upper Intermediate",
    nameAr: "B2 – فوق المتوسط",
    cefr: "B2",
    durationEn: "120 Days",
    durationAr: "120 يومًا",
    units: 30,
    lessons: 227,
    price: 698,
    descriptionEn:
      "For learners preparing for university seminars, professional communication, and precise writing. The course trains argument, register, and fluency under pressure.",
    descriptionAr:
      "لمن يستعد لحلقات الجامعة والتواصل المهني والكتابة الدقيقة. يدرب المساق الحجاج والأسلوب والطلاقة تحت الضغط.",
    skillsEn: ["Argument and cohesion", "Advanced grammar", "Register", "Essay writing", "Seminar speaking"],
    skillsAr: ["الحجاج والترابط", "قواعد متقدمة", "مستوى الأسلوب", "كتابة المقال", "تحدث الحلقات الدراسية"],
    outcomesEn: [
      "Build a supported argument with clear cohesion.",
      "Control conditionals, inversion, and the passive.",
      "Write formal emails and short essays.",
      "Speak for several minutes with organized ideas.",
    ],
    outcomesAr: [
      "بناء حجة مدعومة بترابط واضح.",
      "السيطرة على الشرط والقلب والمبني للمجهول.",
      "كتابة رسائل رسمية ومقالات قصيرة.",
      "التحدث لعدة دقائق بأفكار منظمة.",
    ],
    curriculum: {
      units: units(
        [
          ["Mixed Conditionals", "الشرطي المختلط"],
          ["Inversion for Emphasis", "القلب للتوكيد"],
          ["Advanced Passive", "المبني للمجهول المتقدم"],
          ["Cleft Sentences", "جمل الفصل"],
          ["Participle Clauses", "عبارات اسم الفاعل"],
          ["Noun Phrases & Nominalisation", "العبارات الاسمية والتحويل للاسم"],
          ["Hedging & Stance", "التحفظ وإظهار الموقف"],
          ["Cohesion & Reference", "الترابط والإحالة"],
          ["Argument Structure", "بنية الحجة"],
          ["Concession & Contrast", "التنازل والتباين"],
          ["Cause, Result & Purpose", "السبب والنتيجة والغرض"],
          ["Relative Clauses Advanced", "جمل الوصل المتقدمة"],
          ["Reported Speech Nuance", "دقائق الكلام المنقول"],
          ["Modals of Deduction", "أفعال الاستنتاج"],
          ["Phrasal Verbs II", "الأفعال المركبة 2"],
          ["Collocation & Register", "التصاحب ومستوى اللغة"],
          ["Academic Reading", "القراءة الأكاديمية"],
          ["Critical Listening", "الاستماع النقدي"],
          ["Essay Planning", "تخطيط المقال"],
          ["Data Commentary", "التعليق على البيانات"],
          ["Formal Emails", "الرسائل الرسمية"],
          ["Meetings & Negotiation", "الاجتماعات والتفاوض"],
          ["Presentations", "العروض"],
          ["Idiomatic Language", "اللغة الاصطلاحية"],
          ["Precision Vocabulary", "المفردات الدقيقة"],
          ["Pronunciation for Clarity", "النطق من أجل الوضوح"],
          ["Error Log & Self-editing", "سجل الأخطاء والتحرير الذاتي"],
          ["Timed Writing", "الكتابة الموقوتة"],
          ["Fluency under Pressure", "الطلاقة تحت الضغط"],
          ["B2 Mastery Review", "مراجعة إتقان B2"],
        ],
        b2Counts,
      ),
    },
    faqs: sharedFaqs,
    contactPricing: false,
    sortOrder: 4,
  }),
  course({
    slug: "c1-advanced",
    nameEn: "C1 – Advanced",
    nameAr: "C1 – متقدم",
    cefr: "C1",
    durationEn: "Customized duration",
    durationAr: "مدة مخصصة",
    units: 8,
    lessons: 48,
    unitsLabelEn: "Personalized learning plan",
    unitsLabelAr: "خطة تعلم شخصية",
    lessonsLabelEn: "Advanced English skills",
    lessonsLabelAr: "مهارات إنجليزية متقدمة",
    price: 797.5,
    descriptionEn:
      "A personalized advanced plan for nuanced argument, professional tone, and precise control of complex English. The listed fee covers the personalized plan; duration is confirmed after a consultation.",
    descriptionAr:
      "خطة متقدمة شخصية للحجاج الدقيق والأسلوب المهني والسيطرة على الإنجليزية المعقدة. الرسم المعروض يغطي الخطة الشخصية، وتُؤكد المدة بعد استشارة.",
    skillsEn: ["Nuance and tone", "Complex argument", "Research writing", "Professional communication", "Advanced listening"],
    skillsAr: ["الدقة والنبرة", "الحجاج المعقد", "الكتابة البحثية", "التواصل المهني", "الاستماع المتقدم"],
    outcomesEn: [
      "Adjust tone for academic and professional audiences.",
      "Develop a personal error and style plan.",
      "Handle abstract topics without simplifying the idea.",
      "Edit your own writing at sentence and text level.",
    ],
    outcomesAr: [
      "ضبط النبرة للجمهور الأكاديمي والمهني.",
      "وضع خطة شخصية للأخطاء والأسلوب.",
      "مناقشة موضوعات مجردة دون تبسيط الفكرة.",
      "تحرير كتابتك على مستوى الجملة والنص.",
    ],
    curriculum: {
      units: units(
        [
          ["Nuance, Tone & Register", "الدقة والنبرة ومستوى اللغة"],
          ["Complex Argument", "الحجاج المعقد"],
          ["Abstract Vocabulary", "المفردات المجردة"],
          ["Advanced Listening", "الاستماع المتقدم"],
          ["Research Writing", "الكتابة البحثية"],
          ["Professional Communication", "التواصل المهني"],
          ["Idiom, Metaphor & Style", "الاصطلاح والاستعارة والأسلوب"],
          ["Personal Mastery Plan", "خطة الإتقان الشخصية"],
        ],
        Array(8).fill(6),
      ),
    },
    faqs: [
      ...sharedFaqs,
      {
        qEn: "How does C1 pricing work?",
        qAr: "كيف يعمل تسعير C1؟",
        aEn: "C1 includes a personalized plan. The listed fee is the current FASLA price after the 50% discount; duration is confirmed after consultation.",
        aAr: "يتضمن C1 خطة شخصية. الرسم المعروض هو سعر FASLA الحالي بعد خصم 50%، وتُؤكد المدة بعد الاستشارة.",
      },
    ],
    contactPricing: false,
    sortOrder: 5,
  }),
  course({
    slug: "grammar-mastery",
    nameEn: "Grammar Mastery",
    nameAr: "إتقان القواعد",
    cefr: "A1–C1",
    durationEn: "50 Days",
    durationAr: "50 يومًا",
    units: 12,
    lessons: 96,
    price: 280,
    descriptionEn:
      "Grammar from beginner patterns to advanced control, with practical exercises and real-life applications. Built for learners who understand rules in Arabic but still hesitate in English.",
    descriptionAr:
      "القواعد من الأنماط الأولى إلى السيطرة المتقدمة، مع تدريبات عملية وتطبيقات حياتية. لمن يفهم القاعدة بالعربية ويتردد عند استخدامها بالإنجليزية.",
    skillsEn: ["Form and meaning", "Error correction", "Sentence building", "Real-life application", "Self-editing"],
    skillsAr: ["الصيغة والمعنى", "تصحيح الأخطاء", "بناء الجملة", "تطبيق حياتي", "التحرير الذاتي"],
    outcomesEn: [
      "Choose the right tense from meaning, not memorization alone.",
      "Correct frequent Arabic-speaker errors.",
      "Build longer, accurate sentences.",
      "Edit a paragraph with a clear checklist.",
    ],
    outcomesAr: [
      "اختيار الزمن الصحيح من المعنى لا من الحفظ وحده.",
      "تصحيح أخطاء شائعة لدى الناطقين بالعربية.",
      "بناء جمل أطول ودقيقة.",
      "تحرير فقرة بقائمة مراجعة واضحة.",
    ],
    curriculum: {
      units: units(
        [
          ["Sentence Building Blocks", "لبنات بناء الجملة"],
          ["Present Tenses", "أزمنة المضارع"],
          ["Past Tenses", "أزمنة الماضي"],
          ["Future Forms", "صيغ المستقبل"],
          ["Modals", "الأفعال الناقصة"],
          ["Articles & Determiners", "أدوات التعريف والتحديد"],
          ["Clauses", "الجمل الفرعية"],
          ["Conditionals", "الجمل الشرطية"],
          ["Passive & Causative", "المبني للمجهول والسببي"],
          ["Reported Speech", "الكلام المنقول"],
          ["Prepositions & Phrasal Verbs", "حروف الجر والأفعال المركبة"],
          ["Error Patterns of Arabic Speakers", "أنماط أخطاء الناطقين بالعربية"],
        ],
        Array(12).fill(8),
      ),
    },
    faqs: sharedFaqs,
    contactPricing: false,
    sortOrder: 6,
  }),
  course({
    slug: "speaking-mastery",
    nameEn: "Speaking Mastery",
    nameAr: "إتقان التحدث",
    cefr: "A2–C1",
    durationEn: "40 Days",
    durationAr: "40 يومًا",
    units: 10,
    lessons: 80,
    price: 260,
    descriptionEn:
      "A practical speaking course for pronunciation, fluency, daily conversations, and speaking confidence. You train the sounds, rhythm, and habits that make English easier to follow.",
    descriptionAr:
      "دورة تحدث عملية للنطق والطلاقة والحوارات اليومية وثقة الكلام. تدرب الأصوات والإيقاع والعادات التي تجعل الإنجليزية أوضح للمستمع.",
    skillsEn: ["Pronunciation", "Fluency", "Daily conversations", "Speaking confidence", "Connected speech"],
    skillsAr: ["النطق", "الطلاقة", "حوارات يومية", "ثقة التحدث", "الكلام المتصل"],
    outcomesEn: [
      "Pronounce high-impact sounds more clearly.",
      "Keep a conversation going without translating every word.",
      "Use stress and pausing to sound clearer.",
      "Speak for a minute on a familiar topic with less hesitation.",
    ],
    outcomesAr: [
      "نطق الأصوات عالية التأثير بوضوح أكبر.",
      "متابعة الحوار دون ترجمة كل كلمة.",
      "استخدام النبر والوقف ليصبح الكلام أوضح.",
      "التحدث لدقيقة عن موضوع مألوف بتردد أقل.",
    ],
    curriculum: {
      units: units(
        [
          ["Sounds that Change Meaning", "أصوات تغيّر المعنى"],
          ["Word Stress & Sentence Stress", "نبر الكلمة ونبر الجملة"],
          ["Connected Speech", "الكلام المتصل"],
          ["Everyday Conversations", "حوارات يومية"],
          ["Asking & Clarifying", "السؤال والاستيضاح"],
          ["Storytelling", "سرد القصص"],
          ["Opinions & Polite Disagreement", "الآراء والاختلاف المهذب"],
          ["Presentations", "العروض"],
          ["Interviews & Academic Speaking", "المقابلات والتحدث الأكاديمي"],
          ["Fluency & Confidence Labs", "مختبرات الطلاقة والثقة"],
        ],
        Array(10).fill(8),
      ),
    },
    faqs: sharedFaqs,
    contactPricing: false,
    sortOrder: 7,
  }),
];

export const testimonialSeed = [
  {
    nameEn: "Mariam Hassan",
    nameAr: "مريم حسن",
    affiliationEn: "Faculty of Engineering, Cairo University",
    affiliationAr: "كلية الهندسة، جامعة القاهرة",
    rating: 5,
    reviewEn: "The A2 path made grammar feel organized for the first time. I still need speaking practice, but I can follow lectures with less stress.",
    reviewAr: "جعل مسار A2 القواعد منظمة بالنسبة لي لأول مرة. ما زلت أحتاج تدريب التحدث، لكنني أتابع المحاضرات بتوتر أقل.",
    initials: "MH",
    avatarHue: 212,
    isDemo: true,
    sortOrder: 1,
  },
  {
    nameEn: "Youssef Adel",
    nameAr: "يوسف عادل",
    affiliationEn: "Faculty of Medicine, Ain Shams University",
    affiliationAr: "كلية الطب، جامعة عين شمس",
    rating: 5,
    reviewEn: "I used the placement report to stop guessing my level. The B1 course then gave me medical-school vocabulary in a sequence I could actually revise.",
    reviewAr: "استخدمت تقرير تحديد المستوى لأتوقف عن تخمين مستواي. ثم أعطتني دورة B1 مفردات كلية الطب بتسلسل أستطيع مراجعته فعلًا.",
    initials: "YA",
    avatarHue: 208,
    isDemo: true,
    sortOrder: 2,
  },
  {
    nameEn: "Nour El-Din Farid",
    nameAr: "نور الدين فريد",
    affiliationEn: "Faculty of Commerce, Alexandria University",
    affiliationAr: "كلية التجارة، جامعة الإسكندرية",
    rating: 4,
    reviewEn: "Speaking labs were the useful part for me. I still pause, but I no longer switch to Arabic in the first minute of a conversation.",
    reviewAr: "كانت مختبرات التحدث هي الجزء المفيد لي. ما زلت أتوقف، لكنني لم أعد أتحول إلى العربية في الدقيقة الأولى من الحوار.",
    initials: "NF",
    avatarHue: 32,
    isDemo: true,
    sortOrder: 3,
  },
  {
    nameEn: "Salma Magdy",
    nameAr: "سلمى مجدي",
    affiliationEn: "Faculty of Arts, Cairo University",
    affiliationAr: "كلية الآداب، جامعة القاهرة",
    rating: 5,
    reviewEn: "The writing tasks were short enough to finish and specific enough to show me why my paragraphs felt unclear.",
    reviewAr: "كانت مهام الكتابة قصيرة بما يكفي لإكمالها ومحددة بما يكفي لتبين لي لماذا كانت فقراتي غير واضحة.",
    initials: "SM",
    avatarHue: 214,
    isDemo: true,
    sortOrder: 4,
  },
  {
    nameEn: "Omar Khaled",
    nameAr: "عمر خالد",
    affiliationEn: "Faculty of Computers and AI, Helwan University",
    affiliationAr: "كلية الحاسبات والذكاء الاصطناعي، جامعة حلوان",
    rating: 5,
    reviewEn: "I liked that the lessons named the skill, not just the topic. It made revision before exams much easier.",
    reviewAr: "أعجبني أن الدروس تسمي المهارة لا الموضوع فقط. جعل ذلك المراجعة قبل الامتحانات أسهل كثيرًا.",
    initials: "OK",
    avatarHue: 210,
    isDemo: true,
    sortOrder: 5,
  },
  {
    nameEn: "Hana Tarek",
    nameAr: "هنا طارق",
    affiliationEn: "Faculty of Pharmacy, Mansoura University",
    affiliationAr: "كلية الصيدلة، جامعة المنصورة",
    rating: 4,
    reviewEn: "Pronunciation drills fixed a few sounds that people always asked me to repeat. The progress felt small and real, which I trust more than big promises.",
    reviewAr: "أصلح تدريب النطق أصواتًا كان الناس يطلبون مني إعادتها دائمًا. كان التقدم صغيرًا وحقيقيًا، وهذا أصدق عندي من الوعود الكبيرة.",
    initials: "HT",
    avatarHue: 36,
    isDemo: true,
    sortOrder: 6,
  },
  {
    nameEn: "Karim Mostafa",
    nameAr: "كريم مصطفى",
    affiliationEn: "Faculty of Law, Ain Shams University",
    affiliationAr: "كلية الحقوق، جامعة عين شمس",
    rating: 5,
    reviewEn: "B2 argument lessons helped me structure a moot-court answer. I still edit slowly, but the shape of the answer is finally there.",
    reviewAr: "ساعدتني دروس الحجاج في B2 على تنظيم إجابة في محكمة صورية. ما زلت أحرر ببطء، لكن شكل الإجابة صار موجودًا أخيرًا.",
    initials: "KM",
    avatarHue: 216,
    isDemo: true,
    sortOrder: 7,
  },
  {
    nameEn: "Laila Samir",
    nameAr: "ليلى سمير",
    affiliationEn: "Faculty of Mass Communication, Cairo University",
    affiliationAr: "كلية الإعلام، جامعة القاهرة",
    rating: 5,
    reviewEn: "The course did not try to entertain me. It gave me a clear unit, a task, and feedback I could use the same day.",
    reviewAr: "لم تحاول الدورة تسليتي. أعطتني وحدة واضحة ومهمة وملاحظات أستطيع استخدامها في اليوم نفسه.",
    initials: "LS",
    avatarHue: 205,
    isDemo: true,
    sortOrder: 8,
  },
  {
    nameEn: "Ahmed Fathy",
    nameAr: "أحمد فتحي",
    affiliationEn: "Faculty of Science, Assiut University",
    affiliationAr: "كلية العلوم، جامعة أسيوط",
    rating: 4,
    reviewEn: "I joined after the placement test put me in A2, not B1 as I had hoped. That was annoying for a day and useful for the next two months.",
    reviewAr: "التحقت بعد أن وضعني اختبار تحديد المستوى في A2 لا في B1 كما كنت آمل. كان ذلك مزعجًا ليوم ومفيدًا للشهرين التاليين.",
    initials: "AF",
    avatarHue: 28,
    isDemo: true,
    sortOrder: 9,
  },
  {
    nameEn: "Farida Nabil",
    nameAr: "فريدة نبيل",
    affiliationEn: "Faculty of Economics and Political Science, Cairo University",
    affiliationAr: "كلية الاقتصاد والعلوم السياسية، جامعة القاهرة",
    rating: 5,
    reviewEn: "Grammar Mastery was the missing piece beside my degree reading. I stopped translating every relative clause.",
    reviewAr: "كانت دورة إتقان القواعد هي القطعة الناقصة بجانب قراءات الكلية. توقفت عن ترجمة كل جملة وصل.",
    initials: "FN",
    avatarHue: 218,
    isDemo: true,
    sortOrder: 10,
  },
  {
    nameEn: "Hassan Emad",
    nameAr: "حسن عماد",
    affiliationEn: "Faculty of Dentistry, Alexandria University",
    affiliationAr: "كلية طب الأسنان، جامعة الإسكندرية",
    rating: 5,
    reviewEn: "The seven-question challenge was only a start. The full report showed that listening, not grammar, was my real gap.",
    reviewAr: "كان تحدي الأسئلة السبعة مجرد بداية. أظهر التقرير الكامل أن الاستماع، لا القواعد، هو فجوتي الحقيقية.",
    initials: "HE",
    avatarHue: 211,
    isDemo: true,
    sortOrder: 11,
  },
  {
    nameEn: "Jana Hossam",
    nameAr: "جنا حسام",
    affiliationEn: "Faculty of Education, Zagazig University",
    affiliationAr: "كلية التربية، جامعة الزقازيق",
    rating: 4,
    reviewEn: "I recommended the beginner path to my younger cousin because the units are named like a syllabus, not like a slogan.",
    reviewAr: "أوصيت ابنة عمي بالمسار المبتدئ لأن الوحدات مسماة كمنهج لا كشعار.",
    initials: "JH",
    avatarHue: 40,
    isDemo: true,
    sortOrder: 12,
  },
];
