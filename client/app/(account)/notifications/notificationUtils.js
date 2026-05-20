import { getRecordId } from "../../_lib/ui.js";

export function countUnreadNotifications(notifications = []) {
  return notifications.filter((notification) => !notification.readAt).length;
}

export function markNotificationRead(notifications = [], notificationId, readAt) {
  return notifications.map((notification) =>
    getRecordId(notification) === notificationId
      ? { ...notification, readAt, isRead: true }
      : notification,
  );
}

export function markAllNotificationsRead(notifications = [], readAt) {
  return notifications.map((notification) => ({
    ...notification,
    readAt,
    isRead: true,
  }));
}

export function getNotificationTypeLabel(type) {
  const labels = {
    application_submitted: "Application",
    application_status: "Status",
    job_saved: "Saved job",
    job_closed: "Job",
    job_pending_review: "Review",
    job_approved: "Approved",
    job_declined: "Declined",
    role_change_requested: "Role request",
    role_change_approved: "Role approved",
    role_change_declined: "Role declined",
    message: "Message",
    system: "System",
  };

  return labels[type] ?? "Update";
}
