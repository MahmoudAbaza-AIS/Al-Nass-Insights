import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

const STORAGE_KEY = "alnass.dashboard.displayPrefs";

export interface DisplayPreferences {
  timeZone: string;
  presentationMode: boolean;
  refreshIntervalMs: number;
}

type Action =
  | { type: "setTimeZone"; timeZone: string }
  | { type: "setPresentationMode"; value: boolean }
  | { type: "setRefreshInterval"; ms: number }
  | { type: "hydrate"; prefs: DisplayPreferences };

const defaults: DisplayPreferences = {
  timeZone: "Asia/Riyadh",
  presentationMode: false,
  refreshIntervalMs: 60_000,
};

function loadPrefs(): DisplayPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<DisplayPreferences>;
    return {
      timeZone: typeof parsed.timeZone === "string" ? parsed.timeZone : defaults.timeZone,
      presentationMode: false,
      refreshIntervalMs:
        typeof parsed.refreshIntervalMs === "number"
          ? parsed.refreshIntervalMs
          : defaults.refreshIntervalMs,
    };
  } catch {
    return defaults;
  }
}

function persist(prefs: DisplayPreferences) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timeZone: prefs.timeZone,
        refreshIntervalMs: prefs.refreshIntervalMs,
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function reducer(state: DisplayPreferences, action: Action): DisplayPreferences {
  switch (action.type) {
    case "hydrate":
      return action.prefs;
    case "setTimeZone":
      return { ...state, timeZone: action.timeZone };
    case "setPresentationMode":
      return { ...state, presentationMode: action.value };
    case "setRefreshInterval":
      return { ...state, refreshIntervalMs: action.ms };
    default:
      return state;
  }
}

const DisplayStateContext = createContext<DisplayPreferences | null>(null);
const DisplayDispatchContext = createContext<{
  setTimeZone: (tz: string) => void;
  setPresentationMode: (value: boolean) => void;
  setRefreshInterval: (ms: number) => void;
} | null>(null);

export function DisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPrefs);

  const setTimeZone = useCallback((timeZone: string) => {
    dispatch({ type: "setTimeZone", timeZone });
  }, []);
  const setPresentationMode = useCallback((value: boolean) => {
    dispatch({ type: "setPresentationMode", value });
  }, []);
  const setRefreshInterval = useCallback((ms: number) => {
    dispatch({ type: "setRefreshInterval", ms });
  }, []);

  const api = useMemo(
    () => ({ setTimeZone, setPresentationMode, setRefreshInterval }),
    [setTimeZone, setPresentationMode, setRefreshInterval],
  );

  useEffect(() => {
    persist(state);
  }, [state]);

  return (
    <DisplayStateContext.Provider value={state}>
      <DisplayDispatchContext.Provider value={api}>{children}</DisplayDispatchContext.Provider>
    </DisplayStateContext.Provider>
  );
}

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
