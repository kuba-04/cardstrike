import { Label } from "./ui/label";

interface LanguageSelectorProps {
  frontLanguage: string;
  backLanguage: string;
  onFrontLanguageChange: (language: string) => void;
  onBackLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const COMMON_LANGUAGES = [
  { value: "", label: "Auto-detect" },
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Turkish", label: "Turkish" },
  { value: "Polish", label: "Polish" },
  { value: "Dutch", label: "Dutch" },
  { value: "Swedish", label: "Swedish" },
  { value: "Norwegian", label: "Norwegian" },
  { value: "Danish", label: "Danish" },
  { value: "Finnish", label: "Finnish" },
  { value: "Greek", label: "Greek" },
  { value: "Hebrew", label: "Hebrew" },
  { value: "Thai", label: "Thai" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Indonesian", label: "Indonesian" },
];

export function LanguageSelector({
  frontLanguage,
  backLanguage,
  onFrontLanguageChange,
  onBackLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border">
      <div className="space-y-2">
        <Label htmlFor="front-language" className="text-sm font-medium">
          Input Language (Front of Card)
        </Label>
        <select
          id="front-language"
          value={frontLanguage}
          onChange={(e) => onFrontLanguageChange(e.target.value)}
          disabled={disabled}
          className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {COMMON_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          The language of the text you're providing
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="back-language" className="text-sm font-medium">
          Translation Language (Back of Card)
        </Label>
        <select
          id="back-language"
          value={backLanguage}
          onChange={(e) => onBackLanguageChange(e.target.value)}
          disabled={disabled}
          className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {COMMON_LANGUAGES.filter((lang) => lang.value !== "").map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          The language for translations/definitions
        </p>
      </div>
    </div>
  );
}
