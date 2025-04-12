import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TextInputAreaProps {
    value: string;
    onChange: (value: string) => void;
    minLength: number;
    maxLength: number;
    disabled?: boolean;
}

export function TextInputArea({
    value,
    onChange,
    minLength,
    maxLength,
    disabled = false
}: TextInputAreaProps) {
    const characterCount = value.length;
    const isValid = characterCount >= minLength && characterCount <= maxLength;
    const isUnderMinLength = characterCount < minLength;
    const isOverMaxLength = characterCount > maxLength;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="source-text" className="text-base">
                    Source Text
                </Label>
                <span
                    className={`text-sm ${!isValid ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                >
                    {characterCount} / {maxLength} characters
                </span>
            </div>

            <Textarea
                id="source-text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`min-h-[200px] ${isUnderMinLength || isOverMaxLength ? 'border-destructive' : ''
                    }`}
                placeholder="Paste your text here (100-10,000 characters)"
            />

            {isUnderMinLength && (
                <p className="text-sm text-destructive">
                    Text must be at least {minLength} characters
                </p>
            )}
            {isOverMaxLength && (
                <p className="text-sm text-destructive">
                    Text must not exceed {maxLength} characters
                </p>
            )}
        </div>
    );
} 