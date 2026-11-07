import { desc } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  placementTestAttempts,
  placementTestResults,
  registrations,
  students,
  testimonials,
  whatsappNotifications,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const [studentRows, registrationRows, attemptRows, resultRows, courseRows, testimonyRows, notifications, settings] = await Promise.all([
    db.select().from(students).orderBy(desc(students.createdAt)).limit(300),
    db.select().from(registrations).orderBy(desc(registrations.createdAt)).limit(300),
    db.select().from(placementTestAttempts).orderBy(desc(placementTestAttempts.startedAt)).limit(300),
    db.select().from(placementTestResults).orderBy(desc(placementTestResults.createdAt)).limit(300),
    db.select().from(courses).orderBy(courses.sortOrder),
    db.select().from(testimonials).orderBy(testimonials.sortOrder),
    db.select().from(whatsappNotifications).orderBy(desc(whatsappNotifications.createdAt)).limit(200),
    getSettings(),
  ]);
  return Response.json({
    ok: true,
    session,
    students: studentRows,
    registrations: registrationRows,
    attempts: attemptRows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      age: row.age,
      governorate: row.governorate,
      whatsapp: row.whatsapp,
      phoneNormalized: row.phoneNormalized,
      status: row.status,
      currentIndex: row.currentIndex,
      total: row.questionOrder.length,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    })),
    results: resultRows,
    courses: courseRows,
    testimonials: testimonyRows,
    notifications,
    settings,
  });
}
