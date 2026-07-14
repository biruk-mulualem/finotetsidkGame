// In your Node console or temporary test endpoint
const { convertEthiopianToGregorian } = require('./utils/dateConverter');

console.log(convertEthiopianToGregorian('01/01/1958')); 
// Should output: 1965-09-11

console.log(convertEthiopianToGregorian('12/12/1958')); 
// Month 12 (Nehase) should convert to August 1966
// Expected: 1966-08-18 or 1966-08-19

console.log(convertEthiopianToGregorian('13/07/2026'));
// Month 7 (Megabit) should convert to March 1977
// Expected: 1977-03-22