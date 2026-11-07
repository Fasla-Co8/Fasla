import type { Metadata } from "next";
import { CourseCard, CoursesIntro, PageShell } from "@/components/SiteChrome";
import { getPublicData } from "@/lib/public-data";

export const metadata: Metadata = { title: "Courses", description: "FASLA English courses from A1 to C1, plus Grammar Mastery and Speaking Mastery." };

export default async function CoursesPage() {
  const data = await getPublicData();
  return (
    <PageShell courses={data.courses} settings={data.settings}>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <CoursesIntro />
        <div className="mt-8 flex flex-wrap gap-5">
          {data.courses.map((course) => <CourseCard key={course.slug} course={course} />)}
        </div>
      </section>
    </PageShell>
  );
}
