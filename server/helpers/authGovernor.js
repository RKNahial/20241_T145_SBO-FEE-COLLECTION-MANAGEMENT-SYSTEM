const bcrypt = require('bcrypt');



// Function to hash a password
const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                console.error('Salt generation error:', err);
                return reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    console.error('Hashing error:', err);
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

// Function to compare a password with a hashed password
const comparePassword = async (password, hashed) => {
    const result = await bcrypt.compare(password, hashed);
    console.log(`Comparing password: "${password}" with hashed: "${hashed}" results in: ${result}`);
    return result;
};

module.exports = {
    hashPassword,
    comparePassword,
};
//hashisng