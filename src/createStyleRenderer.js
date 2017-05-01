/**
 * Returns a single style object provided styleArray and stylesMap
 */
const reduceStyles = (styleArray, stylesMap) => styleArray
  .map(style => stylesMap[style])
  .reduce((prev, next) => Object.assign({}, prev, next), {});

/**
 * Returns a styleRenderer from a customStyleMap and a wrapper callback (Component)
 */
const createStyleRenderer = (wrapper, stylesMap) => (children, styleArray, params) => {
  const style = reduceStyles(styleArray, stylesMap);
  return wrapper(Object.assign({}, { children }, params, { style }));
};

export default createStyleRenderer;
