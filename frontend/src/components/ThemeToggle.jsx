import { useTheme } from "../ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
