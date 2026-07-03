import bcrypt from "bcryptjs";
import db from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  checkRequired,
} from "../utils/validation.js";

const { User, RefreshToken } = db;

// ============ REGISTER ============
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, bio, role = "student" } = req.body;

    // Validate required fields
    const required = checkRequired(["name", "email", "password"], req.body);
    if (!required.valid) {
      return res.status(400).json({
        success: false,
        message: required.message,
      });
    }

    if (!isValidName(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash,
      role,
      phone,
      bio,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    const expiresIn = process.env.JWT_REFRESH_EXPIRE || "30d";
    const expiresAt = new Date();
    const days = parseInt(expiresIn);
    expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 30 : days));

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    const userData = user.toJSON();
    delete userData.password_hash;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// ============ LOGIN ============
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const required = checkRequired(["email", "password"], req.body);
    if (!required.valid) {
      return res.status(400).json({
        success: false,
        message: required.message,
      });
    }

    const user = await User.findOne({
      where: { email },
      attributes: { include: ["password_hash"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    const expiresIn = process.env.JWT_REFRESH_EXPIRE || "30d";
    const expiresAt = new Date();
    const days = parseInt(expiresIn);
    expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 30 : days));

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password_hash;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

// ============ REFRESH TOKEN ============
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Check if token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        is_revoked: false,
      },
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Check if token is expired
    if (new Date() > storedToken.expires_at) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: error.message,
    });
  }
};

// ============ LOGOUT ============
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke the refresh token
      await RefreshToken.update(
        { is_revoked: true },
        { where: { token: refreshToken } },
      );
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};

// ============ GET CURRENT USER ============
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// ============ UPDATE PROFILE ============
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, profile_picture } = req.body;
    const userId = req.user.id;

    // Build update object
    const updates = {};
    if (name) {
      if (!isValidName(name)) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 50 characters",
        });
      }
      updates.name = name;
    }
    if (phone) updates.phone = phone;
    if (bio) updates.bio = bio;
    if (profile_picture) updates.profile_picture = profile_picture;

    // Update user
    await User.update(updates, { where: { id: userId } });

    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password_hash"] },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// ============ CHANGE PASSWORD ============
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Get user with password
    const user = await User.findByPk(userId, {
      attributes: { include: ["password_hash"] },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.update({ password_hash }, { where: { id: userId } });

    // Revoke all refresh tokens for security
    await RefreshToken.update(
      { is_revoked: true },
      { where: { user_id: userId } },
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login again.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};
