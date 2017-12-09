import redraft from '../src';
import * as raws from './utils/raws';
import { joinRecursively } from './utils/helpers';

const inline = {
  BOLD: (children) => `<strong>${children.join('')}</strong>`,
  ITALIC: (children) => `<em>${children.join('')}</em>`,
};

const blocks = {
  unstyled: (children) => `<p>${joinRecursively(children)}</p>`,
};

const entities = {
  ENTITY: (children, entity) => `<div style="color: ${entity.data.color}" >${joinRecursively(children)}</div>`,
};

const renderers = {
  inline,
  blocks,
  entities,
};

describe('redraft with unicode', () => {
  test(
    'should apply ranges properly for surrogate pairs at the end of a block',
    () => {
      const rendered = redraft(raws.rawWithEmoji, renderers);
      const joined = joinRecursively(rendered);
      expect(joined).toBe('<p><strong>abc <em>😀</em></strong></p>'); // eslint-disable-line max-len
    }
  );
  test('should apply ranges properly for multiple surrogate pairs', () => {
    const rendered = redraft(raws.rawWithEmoji2, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe('<p><strong>😺</strong>😀</p>'); // eslint-disable-line max-len
  });
  test('should handle entities with surrogate pairs', () => {
    const rendered = redraft(raws.rawWithEmoji3, renderers);
    const joined = joinRecursively(rendered);
    expect(joined).toBe('<p><strong>😺</strong>12345<div style="color: #ee6a56" >6😀</div></p>'); // eslint-disable-line max-len
  });
});
