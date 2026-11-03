import { expect, test } from 'vitest';
import { renderToString } from 'preact-render-to-string';
import { Container } from './index';

test('renders children inside the styled container', () => {
    expect(renderToString(<Container><span>Текст</span></Container>))
        .toBe('<div class="container"><span>Текст</span></div>');
});
