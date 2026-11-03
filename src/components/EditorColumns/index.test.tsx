import { expect, test } from 'vitest';
import { renderToString } from 'preact-render-to-string';
import { EditorColumns } from './index';

test('renders left and right editor columns', () => {
    expect(renderToString(<EditorColumns left={<span>Ввод</span>} right={<span>Результат</span>} />))
        .toBe('<div class="editor-columns"><div class="editor-columns__left"><span>Ввод</span></div><div class="editor-columns__right"><span>Результат</span></div></div>');
});
