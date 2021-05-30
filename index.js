#!/usr/bin/env node
function print(text, end = '\n') {
  process.stdout.write(text + end);
}

function printUsageAndExit() {
  process.stdout.write([
    '',
    'Usage: pretty-sleepy [time]',
    '',
    'Sleep for specified amount of time and exit',
    '',
    'If [time] consists of digits only, it is treated as seconds',
    '',
    '[time] can also be specified as hms string consisting of following parts:',
    '',
    '  XXh   XX hours',
    '  XXm   XX minutes',
    '  XXs   XX seconds',
    '  XXms  XX milliseconds',
    '',
    'Every part can be omitted but the parts may only occur once and have to',
    'appear in the order above.',
    '',
    'Examples:',
    '',
    '  pretty-sleepy 5m               Sleep for 5 minutes',
    '  pretty-sleepy 7h3m             Sleep for 7 hours and 3 minutes',
    '  pretty-sleepy 1m350ms          Sleep for 1 minute and 350 milliseconds',
    '  pretty-sleepy 98h40m37s973ms   Sleep for 98 hours, 40 minutes,',
    '                                 37 seconds and 973 milliseconds',
    '  pretty-sleepy 86400s           Sleep for 24 hours',
    ''
  ].join('\n  '));
  process.exit(1);
}

function parseTime(time) {
  if (/^\d+$/.test(time)) {
    return time * 1000;
  }

  const hmsMatch = time.match(/^((\d+)h)?((\d+)m)?((\d+)s)?((\d+)ms)?$/);
  if (hmsMatch) {
    const [,,hr=0,,min=0,,sec=0,,ms=0] = hmsMatch;
    return parseInt(hr) * 3600000 +
           parseInt(min) * 60000 +
           parseInt(sec) * 1000 +
           parseInt(ms);
  }

  return 0
}

function format(timeInMs) {
  const str = String(timeInMs);
  const ms = str.slice(-3).padStart(3, '0');
  const totalSecs = str.slice(0, -3);
  const totalMins = Math.floor(totalSecs / 60);
  const totalHrs = Math.floor(totalMins / 60);
  const secs = String(totalSecs - totalMins * 60).padStart(2, '0');
  const mins = String(totalMins - totalHrs * 60).padStart(2, '0');
  return `${totalHrs}:${mins}:${secs}.${ms}`
}


const [,, time] = process.argv;

if (time === undefined) {
  printUsageAndExit();
}

const duration = parseTime(time);
const endDate = Date.now() + duration;

const FPS = process.env.PRETTY_SLEEPY_FPS ?? process.env.FPS ?? 30;

print(`Sleeping until ${new Date(endDate).toLocaleString()}`);

const interval = setInterval(() => {
  const now = Date.now();
  const remainingTime = endDate - now;
  if (remainingTime <= 0) {
    print('\u001b[0K', '');
    process.exit(0);
  }
  const remainingTimeString = format(remainingTime);
  print(`${remainingTimeString} left...`, '\r');
}, 1000 / FPS);

