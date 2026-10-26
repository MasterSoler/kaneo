import { resolveApiBaseUrl } from "@kaneo/libs";
import {
  INSTANCE_API_UNREACHABLE,
  isVercelProxyUpstreamMissing,
} from "@/lib/api-reachability";
import { HttpError } from "@/lib/http-error";
import { parseApiErrorBody } from "@/lib/parse-api-error-body";

export type InstanceStatus = {
  hasUsers: boolean;
  hasAdmin: boolean;
};

export async function getInstanceStatus(): Promise<InstanceStatus> {
  const baseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_URL);
  const response = await fetch(`${baseUrl}/instance/status`, {
    credentials: "include",
  });
  const bodyText = await response.text().catch(() => "");
  if (!response.ok) {
    if (response.status === 502 && isVercelProxyUpstreamMissing(bodyText)) {
      throw new HttpError(response.status, "Instance API is unreachable", {
        code: INSTANCE_API_UNREACHABLE,
      });
    }
    const parsed = parseApiErrorBody(bodyText);
    const message =
      (parsed ? parsed.message : bodyText).trim() ||
      `Failed to fetch instance status (${response.status})`;
    throw new HttpError(response.status, message, parsed ?? {});
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new HttpError(502, "Instance API returned a non-JSON response", {
      code: INSTANCE_API_UNREACHABLE,
    });
  }
  return JSON.parse(bodyText) as InstanceStatus;
}
