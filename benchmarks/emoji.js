// A benchmark for different methods/libs for string decoding
// As per #27 Array.from is faulty on react-native but its still here for refference
const now = require('performance-now');
const forEach = require('lodash/forEach');
const min = require('lodash/min');
const range = require('lodash/range');
const runes = require('runes');
const punycode = require('punycode');
const chalk = require('chalk');

// 20 chars
const chars = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  '#',
  '1',
  '2',
  '3',
  '?',
  '!',
  '@',
  ' ',
];

// 10 emojis
const emojis = [
  '💙',
  '😺',
  '🎉',
  '💣',
  '✔️',
  '💯',
  '⚛️',
  '💩',
  '🚀',
  '🍵',
];

// Generate a random constant lenght string from a given charcter pool
const makeString = (length, pool) => {
  let string = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * 10000) % pool.length;
    string += pool[index];
  }
  return string;
};

// Get input array with random strings
const getInput = pool => {
  const times = range(0, 10000);
  const strings = [];
  forEach(times, () => {
    strings.push(makeString(50, pool));
  });
  return strings;
};

// Run a cb on each string from input array and return the time diff
const emojiBench = ({ cb, input, label }) => {
  const arr = [];
  const start = now();
  forEach(input, (string) => {
    arr.push(cb(string));
  });
  const time = now() - start;
  console.log(`[${chalk.yellow(label)}]: ${time}`);
  return time;
};

// Define tested methods
// In case of punycode it's required to also decode.
// To be fair other test will concat back to string as well.
const tests = [
  {
    cb: string => Array.from(string).join(''),
    label: 'Array.from',
  },
  {
    cb: string => runes(string).join(''),
    label: 'runes',
  },
  {
    cb: string => punycode.ucs2.encode(punycode.ucs2.decode(string)),
    label: 'punycode',
  },
];

// Executes a single batch of tests, and adds some colors :)
const batch = (input, label) => {
  console.log(`\nRunning: ${chalk.green(label)}`);
  const results = tests.map(test =>
    emojiBench(Object.assign({}, test, { input }))
  );
  const winner = min(results);
  console.log(
    `Best time ${chalk.green(winner)} - ${tests[results.indexOf(winner)].label}`
  );
};

// Run test benchmark
console.log(
  `--- Emoji benchmark running on ${chalk.bold.yellow(process.title)} ${chalk.bold.green(process.version)} ---`
);

// 0 - 10
batch(getInput(emojis), 'Random strings with 100% emojis');
// 10 - 10
batch(getInput([...chars.slice(0, 10), ...emojis]), 'Random strings with 1/2 emojis');
// 20 - 10
batch(getInput([...chars, ...emojis]), 'Random strings with 1/3 emojis');
// 40 - 10
batch(getInput([...chars, ...emojis, ...chars]), 'Random strings with 1/5 emojis');
// 40 - 10
batch(getInput(chars), 'Random strings with no emojis');
