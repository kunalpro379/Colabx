const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGN UP Controller
exports.signup = async (req, res) => {
    
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
    });
    user = await user.save();
    res.status(201).json(user);
    console.log(`New user signed up: ${user}`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// SIGN IN Controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User with this email does not exist!" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey", { expiresIn: '1h' });
    res.json({ token, ...user._doc });
    console.log(`User signed in: ${user} ${token}`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Token Validation Controller
exports.tokenIsValid = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get User Data Controller
// Controller function to fetch user data
exports.getUserData = async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);
      const user = await User.findById(req.user); // Fetch user data based on req.user (user ID)
      
      res.json({ ...user._doc, token: req.token });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };

