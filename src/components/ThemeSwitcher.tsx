import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-2 border-gold-500/30 hover:bg-gold-500/10"
      title={`Switch to ${theme === 'classic' ? 'modern' : 'classic'} theme`}
    >
      <Palette className="w-4 h-4" />
      <span className="hidden sm:inline">
        {theme === 'classic' ? 'Modern' : 'Classic'}
      </span>
    </Button>
  );
};