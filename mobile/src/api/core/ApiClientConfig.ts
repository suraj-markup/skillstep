import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = "8787";
const API_PATH = "/api";

export const DEFAULT_API_BASE_URL =
  readConfiguredApiBaseUrl() ?? `http://${readDevHost() ?? "localhost"}:${API_PORT}${API_PATH}`;

export type ApiHeaders =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

export interface ApiClientConfig {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: ApiHeaders;
}

function readConfiguredApiBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return value ? value : null;
}

function readDevHost(): string | null {
  if (Platform.OS === "web") {
    return readBrowserHost() ?? readExpoHost();
  }

  return readExpoHost() ?? readBrowserHost();
}

function readBrowserHost(): string | null {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }

  return window.location.hostname || null;
}

function readExpoHost(): string | null {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    manifest?: { debuggerHost?: string; hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  };

  return readHostname(
    constants.expoConfig?.hostUri ??
      constants.manifest2?.extra?.expoGo?.debuggerHost ??
      constants.manifest?.debuggerHost ??
      constants.manifest?.hostUri,
  );
}

function readHostname(hostUri: string | undefined): string | null {
  if (!hostUri) {
    return null;
  }

  try {
    const url = new URL(hostUri.includes("://") ? hostUri : `http://${hostUri}`);
    return url.hostname || null;
  } catch {
    return hostUri.split(":")[0] || null;
  }
}
