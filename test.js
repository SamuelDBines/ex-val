const { v } = require('./dist/index');

const s = v.string();
console.log('Validate stuff: ', s.validate('test'));
