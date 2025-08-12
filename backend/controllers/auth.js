const {pool} = require("../model/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const signUp = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    const emailCheckQuery = {
      text: `SELECT email FROM users WHERE email = $1`,
      values: [email],
    };

    const userExists = await pool.query(emailCheckQuery);

    if (userExists.rows.length > 0) {
      console.log(`Email already registered.`);
      return res.status(400).json({ message: `Email already registered.` });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: `Email format is incorrect` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [email, hashedPassword, firstName, lastName, role]
    );


    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = {
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email]
        };
        const userResult = await pool.query(userQuery);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email" });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const {accessToken,refreshToken} = await generateTokens(user);
        res.status(200).json({ message: "Login successful", accessToken, refreshToken });
    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const generateTokens = async (user) => {
    try{
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new Error("Token generation failed");
    }
};


module.exports = {
    signUp,
    signIn
};
