import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetail } from "@/components/CourseDetail";
import { PageShell } from "@/components/SiteChrome";
import { getCourseBySlug, getPublicData } from "@/lib/public-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course" };
  return { title: course.nameEn, description: course.descriptionEn };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, data] = await Promise.all([getCourseBySlug(slug), getPublicData()]);
  if (!course) notFound();
  return (
    <PageShell courses={data.courses} settings={data.settings}>
      <CourseDetail course={course} />
    </PageShell>
  );
}
