export interface CopyButtonProps {
    getContent: () => { text: string; partial: boolean };
    hasPartialSelection: boolean;
    disabled: boolean;
}
