import { createContext } from "react";

export interface DisplayPreferences {
  timeZone: string;
  presentationMode: boolean;
  refreshIntervalMs: number;
}

export interface DisplayPreferencesActions {
  setTimeZone: (tz: string) => void;
  setPresentationMode: (value: boolean) => void;
  setRefreshInterval: (ms: number) => void;
}

export const DisplayStateContext = createContext<DisplayPreferences | null>(null);
export const DisplayDispatchContext = createContext<DisplayPreferencesActions | null>(null);
