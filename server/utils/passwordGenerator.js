const crypto = require('crypto');

const generatePassword = (length = 12) => {
    // Define character sets
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, allChars.length);
        password += allChars[randomIndex];
    }
    
    return password;
};

module.exports = { generatePassword }; 