// A benchmark for different methods/libs for string decoding
// As per #27 Array.from is faulty on react-native but its still here for refference
const now = require('performance-now');
const forEach = require('lodash/forEach');
const min = require('lodash/min');
const range = require('lodash/range');
const runes = require('runes');
const punycode = require('punycode');
const chalk = require('chalk');

// Declare our test string (each has same lenght)
const emojiString =
  'Emoji inbound!!!💙💙💙💙💙x💙💙💙💙💙x💙💙💙💙💙x💙💙💙💙💙';
const plainString = 'No emoji inbound!!!!!x!!!!!x!!!!!x!!!!!';
const minimalEmoji = 'No emoji inbound!!!!!💙!!!!!💙!!!!!💙!!!!!';

// Number of runs
const times = range(0, 10000);

// This will run a cb number of specified times and return the time diff
const emojiBench = ({ cb, input, label }) => {
  const arr = [];
  const start = now();
  forEach(times, (i) => {
    arr.push(cb(input));
  });
  const diff = now() - start;
  console.log(`[${chalk.yellow(label)}]: ${diff}`);
  return diff;
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
  console.log(`\nRunning: ${chalk.green(label)} with ${chalk.yellow(input)}`);
  const results = tests.map(test =>
    emojiBench(Object.assign({}, test, { input }))
  );
  const winner = min(results);
  console.log(`Best time ${chalk.green(winner)} - ${tests[results.indexOf(winner)].label}`);
};

console.log(`--- Emoji benchmark running on ${chalk.bold.yellow(process.title)} ${chalk.bold.green(process.version)} ---`);

batch(emojiString, 'String with emojis');
batch(plainString, 'Plain string');
batch(minimalEmoji, 'Minimal emoji string');
