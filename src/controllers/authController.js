const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await AdminUser.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed_password = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({ email, hashed_password });

    res.status(201).json({ message: "User created successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AdminUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
