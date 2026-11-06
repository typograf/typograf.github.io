import type { ComponentProps } from 'preact';

export type RadioProps = Omit<Extract<ComponentProps<'input'>, { type: 'radio' }>, 'type'>;
