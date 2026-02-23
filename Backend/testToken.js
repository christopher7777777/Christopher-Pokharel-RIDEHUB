const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: '694781cb462d7f891bc41184' }, process.env.JWT_SECRET);
console.log(token);
