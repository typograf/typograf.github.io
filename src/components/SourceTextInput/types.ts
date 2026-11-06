import type { RefObject } from 'preact';

export interface SourceTextInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelectionChange: (input: HTMLTextAreaElement) => void;
    textRef: RefObject<HTMLTextAreaElement | null>;
}

export interface TextSelection {
    value: string;
    start: number;
    end: number;
    direction: HTMLTextAreaElement['selectionDirection'];
}
