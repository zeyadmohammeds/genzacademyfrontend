import { ChartBar, CurrencyCircleDollar, GraduationCap, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { AdminDashboard } from "@/lib/types";

export function AdminDashboardExperience({ dashboard }: { dashboard: AdminDashboard }) {
  const metrics = [
    ["Courses", dashboard.totalCourses, ChartBar],
    ["Active courses", dashboard.activeCourses, GraduationCap],
    ["Revenue", `EGP ${dashboard.revenueEgp.toLocaleString()}`, CurrencyCircleDollar],
    ["Pending submissions", dashboard.pendingSubmissions, WarningCircle]
  ];

  return (
    <main className="page-shell inner-page">
      <section className="admin-hero section-pad">
        <p className="section-kicker">Admin dashboard</p>
        <h1>Executive view for courses, schools, payments, risk, and demand.</h1>
      </section>

      <section className="admin-grid section-pad compact-pad">
        {metrics.map(([label, value, Icon]) => {
          const TypedIcon = Icon as typeof ChartBar;
          return (
            <article className="metric-card" key={String(label)}>
              <TypedIcon size={30} weight="duotone" />
              <span>{String(label)}</span>
              <strong>{String(value)}</strong>
            </article>
          );
        })}
      </section>

      <section className="admin-columns section-pad compact-pad">
        <article className="ops-card">
          <h2>Course demand</h2>
          {dashboard.courseDemand.map((item) => (
            <div className="demand-row" key={item.courseId}>
              <strong>{item.courseTitle}</strong>
              <span>{item.enrollmentCount} enrollments</span>
              <small>EGP {item.revenueEgp.toLocaleString()}</small>
            </div>
          ))}
        </article>

        <article className="ops-card">
          <h2>At-risk students</h2>
          {dashboard.atRiskStudents.map((student) => (
            <div className="demand-row" key={student.studentUserId}>
              <strong>{student.studentName}</strong>
              <span>{student.email}</span>
              <small>{student.missedSessions} missed sessions | {student.pendingTasks} pending tasks</small>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
