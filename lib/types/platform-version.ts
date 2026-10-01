export type PlatformVersionStatus = "ok" | "warning" | "error";

export interface PlatformVersion {
  id: string;
  version: string;
  title: string;
  description: string | null;
  status: PlatformVersionStatus;
  released_at: string;
}
