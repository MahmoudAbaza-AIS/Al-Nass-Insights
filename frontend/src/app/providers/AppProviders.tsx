import type { ReactNode } from "react";
import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { DisplayPreferencesProvider } from "@shared/providers/DisplayPreferencesProvider";

const AlNassPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#e6fbff",
      100: "#c3f4ff",
      200: "#8ce9ff",
      300: "#54dbf5",
      400: "#3de7ff",
      500: "#1aa8c4",
      600: "#14869e",
      700: "#106b7e",
      800: "#0d5564",
      900: "#0a414c",
      950: "#062430",
    },
    colorScheme: {
      dark: {
        surface: {
          0: "#ffffff",
          50: "#e8f1f4",
          100: "#c5d7de",
          200: "#9bb8c2",
          300: "#6f93a0",
          400: "#4f7584",
          500: "#3a5c69",
          600: "#2b4651",
          700: "#1d3340",
          800: "#12252f",
          900: "#0a1820",
          950: "#041016",
        },
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrimeReactProvider
      theme={{
        preset: AlNassPreset,
        options: {
          darkModeSelector: ".dash-dark",
          cssLayer: true,
        },
      }}
    >
      <div className="dash-dark">
        <DisplayPreferencesProvider>{children}</DisplayPreferencesProvider>
      </div>
    </PrimeReactProvider>
  );
}
