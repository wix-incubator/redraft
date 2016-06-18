/**
 * Logs a deprecation message if not in production
 */
const deprecated = msg => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Deprecation warning: redraft - ' + msg + ' reffer to: https://github.com/lokiuz/redraft/blob/master/README.md'); // eslint-disable-line
  }
};

export default deprecated;
