const validateEmail = (req, res, next) => {
    const { email } = req.body;

    // For registration/creation
    if (email) {
        // Ensure email ends with @student.buksu.edu.ph
        if (!email.endsWith('@student.buksu.edu.ph')) {
            req.body.email = email.split('@')[0] + '@student.buksu.edu.ph';
        }
    }

    next();
};

module.exports = validateEmail;
