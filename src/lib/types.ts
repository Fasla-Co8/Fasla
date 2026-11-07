export type Lesson = { titleEn: string; titleAr: string };

export type Unit = {
  titleEn: string;
  titleAr: string;
  objectiveEn: string;
  objectiveAr: string;
  lessons: Lesson[];
};

export type Curriculum = { units: Unit[] };

export type Faq = { qEn: string; qAr: string; aEn: string; aAr: string };

export type CourseDTO = {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  cefr: string;
  durationEn: string;
  durationAr: string;
  units: number;
  lessons: number;
  unitsLabelEn: string | null;
  unitsLabelAr: string | null;
  lessonsLabelEn: string | null;
  lessonsLabelAr: string | null;
  price: number | null;
  currency: string;
  descriptionEn: string;
  descriptionAr: string;
  skillsEn: string[];
  skillsAr: string[];
  outcomesEn: string[];
  outcomesAr: string[];
  curriculum: Curriculum;
  faqs: Faq[];
  contactPricing: boolean;
  sortOrder: number;
  active: boolean;
};

export type TestimonialDTO = {
  id: number;
  nameEn: string;
  nameAr: string;
  affiliationEn: string;
  affiliationAr: string;
  rating: number;
  reviewEn: string;
  reviewAr: string;
  initials: string;
  avatarHue: number;
  isDemo: boolean;
  sortOrder: number;
};

export type PublicSettings = Record<string, string>;
