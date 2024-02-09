const chalk = require("chalk");

/**
 *
 *
 * @param {string} string
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style
 */
const log = (string, style) => {
  const styles = {
    info: { prefix: chalk.blue("[INFO]"), logFunction: console.log },
    err: { prefix: chalk.red("[ERROR]"), logFunction: console.error },
    warn: { prefix: chalk.yellow("[WARNING]"), logFunction: console.warn },
    done: { prefix: chalk.green("[SUCCESS]"), logFunction: console.log },
  };

  const selectedStyle = styles[style] || { logFunction: console.log };
  selectedStyle.logFunction(`${selectedStyle.prefix || ""} ${string}`);
};

/**
 *
 * @param {number} time
 * @param {import('discord.js').TimestampStylesString} style
 * @returns {string}
 */
const time = (time, style) => {
  return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

/**
 * @param {string} id
 * @returns {boolean}
 */
const isSnowflake = (id) => {
  return /^\d+$/.test(id);
};

module.exports = {
  log,
  time,
  isSnowflake,
};
