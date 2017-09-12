import _assignWith from 'lodash.assignwith';

/**
 * Returns a single style object provided styleArray and stylesMap
 */
const reduceStyles = (styleArray, stylesMap) => styleArray
  .map(style => stylesMap[style])
  .reduce((prev, next) => _assignWith(prev, next, (objValue, srcValue) => {
    // key conflict, assign the concatenated value to the key
    if (objValue && srcValue) {
      return objValue.concat(' ', srcValue);
    }
    // assign value
    return undefined;
  }), {}
);

/**
 * Returns a styleRenderer from a customStyleMap and a wrapper callback (Component)
 */
const createStyleRenderer = (wrapper, stylesMap) => (children, styleArray, params) => {
  const style = reduceStyles(styleArray, stylesMap);
  return wrapper(Object.assign({}, { children }, params, { style }));
};

export default createStyleRenderer;
