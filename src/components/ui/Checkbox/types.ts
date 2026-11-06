import type { ComponentProps } from 'preact';

export type CheckboxProps = Omit<Extract<ComponentProps<'input'>, { type: 'checkbox' }>, 'type'>;
