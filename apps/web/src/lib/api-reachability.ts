import type { TFunction } from "i18next";
import { HttpError } from "@/lib/http-error";

export const INSTANCE_API_UNREACHABLE = "INSTANCE_API_UNREACHABLE";

/** Plain-text bodies returned when Vercel cannot reach the configured API proxy target. */
export function isVercelProxyUpstreamMissing(body: string): boolean {
  return (
    body.includes("DNS_HOSTNAME_NOT_FOUND") ||
    body.includes("DEPLOYMENT_NOT_FOUND") ||
    body.includes("ROUTER_EXTERNAL_TARGET_ERROR")
  );
}

export function isInstanceApiUnreachable(error: unknown): boolean {
  return error instanceof HttpError && error.code === INSTANCE_API_UNREACHABLE;
}

export function instanceApiUnreachableMessage(
  t: TFunction,
  scope: "signIn" | "signUp" = "signIn",
): string {
  return t(`auth:${scope}.apiBackendUnreachable`);
}
