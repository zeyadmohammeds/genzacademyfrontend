import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDashboard, getAdminCourses, getAdminRounds, getAdminStudents,
  getAdminEnrollments, getAdminSessions, getAdminAnalytics, getAdminPayments,
  getAdminSchools, getAllApplications, getAdminUsers,
  createAdminCourse, updateAdminCourse, createAdminRound, updateRound,
  updateApplicationStatus, toggleUserActive, updateUserRole,
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "./api";

// ─── Helpers ───────────────────────────────────────

export function useApiGet<T>(key: string[], fn: () => Promise<T>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    staleTime: 30_000,
    ...options,
  });
}

export function useApiMutation<T, V>(fn: (vars: V) => Promise<T>, invalidateKeys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

// ─── Admin Hooks ────────────────────────────────────

export function useAdminDashboard() {
  return useApiGet(["admin", "dashboard"], getAdminDashboard);
}

export function useAdminCourses() {
  return useApiGet(["admin", "courses"], getAdminCourses);
}

export function useAdminRounds() {
  return useApiGet(["admin", "rounds"], getAdminRounds);
}

export function useAdminApplications(statusFilter?: string) {
  return useApiGet(
    ["admin", "applications", statusFilter ?? "all"],
    () => getAllApplications(statusFilter === "all" ? undefined : statusFilter)
  );
}

export function useAdminStudents(search?: string) {
  return useApiGet(
    ["admin", "students", search ?? ""],
    () => getAdminStudents(search || undefined)
  );
}

export function useAdminEnrollments() {
  return useApiGet(["admin", "enrollments"], getAdminEnrollments);
}

export function useAdminSessions() {
  return useApiGet(["admin", "sessions"], getAdminSessions);
}

export function useAdminAnalytics() {
  return useApiGet(["admin", "analytics"], getAdminAnalytics);
}

export function useAdminPayments() {
  return useApiGet(["admin", "payments"], getAdminPayments);
}

export function useAdminSchools() {
  return useApiGet(["admin", "schools"], getAdminSchools);
}

export function useAdminUsers() {
  return useApiGet(["admin", "users"], getAdminUsers);
}

export function useNotificationsList() {
  return useApiGet(["notifications"], getNotifications);
}

// ─── Admin Mutations ────────────────────────────────

export function useCreateCourse() {
  return useApiMutation(
    (data: any) => createAdminCourse(data),
    [["admin", "courses"]]
  );
}

export function useUpdateCourse() {
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => updateAdminCourse(id, data),
    [["admin", "courses"]]
  );
}

export function useCreateRound() {
  return useApiMutation(
    (data: any) => createAdminRound(data),
    [["admin", "rounds"]]
  );
}

export function useUpdateRound() {
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => updateRound(id, data),
    [["admin", "rounds"]]
  );
}

export function useUpdateApplicationStatus() {
  return useApiMutation(
    ({ id, status }: { id: string; status: "Accepted" | "Rejected" }) => updateApplicationStatus(id, status),
    [["admin", "applications"]]
  );
}

export function useToggleUserActive() {
  return useApiMutation(
    (id: string) => toggleUserActive(id),
    [["admin", "team"], ["admin", "users"]]
  );
}

export function useUpdateUserRole() {
  return useApiMutation(
    ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    [["admin", "team"], ["admin", "users"]]
  );
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
