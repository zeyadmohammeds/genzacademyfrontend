import { getCourseBySlug, getCourseRounds } from "@/lib/api";
import { CourseDetailExperience } from "@/components/CourseDetailExperience";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const course = await getCourseBySlug(slug);
  if (!course) {
    return <div className="p-20 text-center font-display text-2xl font-bold">Course not found.</div>;
  }

  const allRounds = await getCourseRounds();
  const rounds = allRounds.filter(r => r.courseId === course.id);
  
  return <CourseDetailExperience course={course} rounds={rounds} />;
}

