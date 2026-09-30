export type NotificationType = "new_file" | "platform_update";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  created_at: string;
}
