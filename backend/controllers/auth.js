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
      return res.status(400).json({ error: `Email already registered.` });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: `Email format is incorrect` });
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
            return res.status(401).json({ error: "Invalid email" });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const userDetails = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
        };

        const {accessToken,refreshToken} = await generateTokens(user);
        res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
        res.status(200).json({ message: "Login successful", accessToken, user: userDetails });
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
            { id: user.id, role: user.role,name: user.first_name },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new Error("Token generation failed");
    }
};


const refreshAccessToken = async (req, res) => {
  try {
    // console.log(req.user)
    const refreshToken = req.cookies.refresh_token;
    // console.log("Refresh Token:", refreshToken);

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log("Decoded Refresh Token:", decoded);

    // 2. Check if token exists in DB (optional but good practice)
    // const query = {
    //   text: `SELECT * FROM refresh_tokens WHERE token = $1`,
    //   values: [refreshToken]
    // };
    // const valid = await pool.query(query);

    // if (valid.rows.length === 0) {
    //   return res.status(401).json({ message: `Refresh token not found in DB` });
    // }

    // 3. Create new access token
    const newAccessToken = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);

    const userDetails = {
            id: user.rows[0].id,
            email: user.rows[0].email,
            firstName: user.rows[0].first_name,
            lastName: user.rows[0].last_name,
            role: user.rows[0].role
        };
    // console.log("User Details:", userDetails);

    return res.status(200).json({ token: newAccessToken,user: userDetails });

  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

const verifyAccessTokenHandler = (req,res) =>{
  return res.status(200).json({ message: true });
}


module.exports = {
    signUp,
    signIn,
    refreshAccessToken,
    verifyAccessTokenHandler
};
