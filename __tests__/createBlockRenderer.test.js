import createBlockRenderer from '../src/createBlockRenderer';

const blockRenderMap = {
  unstyled: {
    element: 'p',
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: 'ul',
  },
};

const mapBlock = (element, props, ...children) => ({
  element,
  props,
  children,
});

const unstyled = {
  element: blockRenderMap.unstyled.element,
  props: { testProp: 'a', key: 'key' },
  children: ['child1', 'child2'],
};

const list = {
  element: blockRenderMap['unordered-list-item'].wrapper,
  props: { testProp: 'a', key: 'key1,key2' },
  children: [
    {
      element: blockRenderMap['unordered-list-item'].element,
      children: ['child1', 'child2'],
      props: {
        key: 'key1',
      },
    },
    {
      element: blockRenderMap['unordered-list-item'].element,
      children: ['child3', 'child4'],
      props: {
        key: 'key2',
      },
    },
  ],
};

const renderer = createBlockRenderer(mapBlock, blockRenderMap);

it('returns a renderer', () => {
  expect(typeof renderer.unstyled).toBe('function');
  expect(typeof renderer['unordered-list-item']).toBe('function');
});

it('function output is correct', () => {
  const unstyledOutput = renderer.unstyled(
    unstyled.children,
    {
      testProp: unstyled.props.testProp,
      depth: 0,
    },
    unstyled.props.key,
  );
  expect(unstyledOutput).toEqual(unstyled);
});

it('function output with wrapper is correct', () => {
  const unstyledOutput = renderer['unordered-list-item'](
    [list.children[0].children, list.children[1].children],
    {
      testProp: list.props.testProp,
      keys:  ['key1', 'key2'],
      depth: 0,
    },
  );
  expect(unstyledOutput).toEqual(list);
});
