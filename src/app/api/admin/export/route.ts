import { asc } from "drizzle-orm";
import { db } from "@/db";
import { courses, placementTestAttempts, placementTestResults, registrations, students } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return Response.json({ ok: false, error: "Export requires an admin role." }, { status: 403 });

  const [studentRows, registrationRows, courseRows, attemptRows, resultRows] = await Promise.all([
    db.select().from(students).orderBy(asc(students.id)),
    db.select().from(registrations),
    db.select().from(courses),
    db.select().from(placementTestAttempts),
    db.select().from(placementTestResults),
  ]);
  const courseById = new Map(courseRows.map((course) => [course.id, course]));
  const attemptByPhone = new Map(attemptRows.map((attempt) => [attempt.phoneNormalized, attempt]));
  const resultByAttempt = new Map(resultRows.map((result) => [result.attemptId, result]));
  const regsByStudent = new Map<number, typeof registrationRows>();
  for (const registration of registrationRows) {
    const list = regsByStudent.get(registration.studentId) ?? [];
    list.push(registration);
    regsByStudent.set(registration.studentId, list);
  }

  const headers = [
    "student_id",
    "full_name",
    "email",
    "whatsapp",
    "alt_phone",
    "age",
    "date_of_birth",
    "gender",
    "governorate",
    "city",
    "english_level",
    "previous_courses",
    "why_learn",
    "difficulties",
    "notes",
    "course",
    "schedule",
    "learning_goals",
    "registration_status",
    "registered_at",
    "placement_status",
    "placement_level",
    "placement_score",
    "placement_percentage",
  ];
  const lines = [headers.join(",")];
  for (const student of studentRows) {
    const regs = regsByStudent.get(student.id) ?? [null];
    for (const registration of regs) {
      const course = registration?.courseId ? courseById.get(registration.courseId) : undefined;
      const attempt = attemptByPhone.get(student.whatsappNormalized);
      const result = attempt ? resultByAttempt.get(attempt.id) : undefined;
      lines.push(
        [
          student.id,
          student.fullName,
          student.email,
          student.whatsapp,
          student.altPhone,
          student.age,
          student.dateOfBirth,
          student.gender,
          student.governorate,
          student.city,
          student.englishLevel,
          student.previousCourses,
          student.whyLearn,
          student.difficulties,
          student.notes,
          course?.nameEn ?? registration?.courseSlug ?? "",
          registration?.schedule ?? "",
          registration?.learningGoals ?? "",
          registration?.status ?? "",
          registration?.createdAt.toISOString() ?? student.createdAt.toISOString(),
          attempt?.status ?? "",
          result?.cefrLevel ?? "",
          result?.score ?? "",
          result?.percentage ?? "",
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return new Response(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=fasla-students.csv",
    },
  });
}
