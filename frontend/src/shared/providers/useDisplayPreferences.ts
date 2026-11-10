import { useContext } from "react";
import {
  DisplayDispatchContext,
  DisplayStateContext,
} from "./displayPreferencesContext";

export function useDisplayPreferences() {
  const ctx = useContext(DisplayStateContext);
  if (!ctx) throw new Error("useDisplayPreferences requires provider");
  return ctx;
}

export function useDisplayPreferencesActions() {
  const ctx = useContext(DisplayDispatchContext);
  if (!ctx) throw new Error("useDisplayPreferencesActions requires provider");
  return ctx;
}
