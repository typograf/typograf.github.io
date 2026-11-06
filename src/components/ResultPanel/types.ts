export type ResultType = 'html' | 'diff';

export interface ResultPanelProps {
    text: string;
    before: string;
    result: string;
    type: ResultType;
    onTypeChange: (type: ResultType) => void;
}
