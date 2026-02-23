const CryptoJS = require("crypto-js");

/**
 * @param {string} secretKey - eSewa secret key
 * @param {string} message
 * @returns {string} 
 */
const generateEsewaSignature = (secretKey, message) => {
    const hash = CryptoJS.HmacSHA256(message, secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
};

module.exports = { generateEsewaSignature };
