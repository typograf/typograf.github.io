import type { ComponentChildren } from 'preact';

export type ResultType = 'text' | 'html' | 'diff';

export interface ResultPanelProps {
    before: string;
    result: string;
    type: ResultType;
    onTypeChange: (type: ResultType) => void;
    actions: ComponentChildren;
}
