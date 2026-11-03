import type { TypografHtmlEntity } from 'typograf';

export type EntityMode = TypografHtmlEntity['type'];

export interface HtmlEntitySettingsProps {
    mode: EntityMode;
    onlyInvisible: boolean;
    onChange: (value: { mode: EntityMode; onlyInvisible: boolean }) => void;
}
