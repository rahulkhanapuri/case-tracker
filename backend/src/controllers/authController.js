import jwt from "jsonwebtoken";
import { body } from "express-validator";
import User from "../models/User.js";
import { USER_ROLES } from "../config/constants.js";

export const authValidation = [
  body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("email").isEmail().withMessage("Please provide a valid email."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(Object.values(USER_ROLES)).withMessage("Role must be manager or agent."),
];

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "verifacts-secret";
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = USER_ROLES.AGENT } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        user,
        token: generateToken(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to register user.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        token: generateToken(user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to login.",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: USER_ROLES.AGENT }).select("name email _id");
    return res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch agents.",
      error: error.message,
    });
  }
};

