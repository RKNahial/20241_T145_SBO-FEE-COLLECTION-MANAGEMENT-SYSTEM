const generatePassword = () => {
    const length = 12; // Password length
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each required character type
    password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ"); // Uppercase
    password += getRandomChar("abcdefghijklmnopqrstuvwxyz"); // Lowercase
    password += getRandomChar("0123456789"); // Number
    password += getRandomChar("!@#$%^&*"); // Special character
    
    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

function getRandomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
}

module.exports = { generatePassword }; 