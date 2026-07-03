import db from "../models/index.js";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  checkRequired,
} from "../utils/validation.js";
import bcrypt from "bcryptjs";

const { User } = db;

// ============ GET ALL USERS (Admin only) ============
export const getAllUsers = async (req, res) => {
  try {
    const { role, is_active, page = 1, limit = 10 } = req.query;

    // Build filter
    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === "true";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password_hash"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// ============ GET USER BY ID ============
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has permission to view this profile
    // Admin can view all, users can only view their own
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own profile.",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// ============ UPDATE USER (Admin only) ============
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, bio, profile_picture, is_active } =
      req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
      // Check if email is taken by another user
      const existingUser = await User.findOne({
        where: { email, id: { [db.Sequelize.Op.ne]: id } },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another user",
        });
      }
      updates.email = email;
    }
    if (role) {
      if (!["admin", "trainer", "student"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be admin, trainer, or student",
        });
      }
      updates.role = role;
    }
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (profile_picture !== undefined)
      updates.profile_picture = profile_picture;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update user
    await User.update(updates, { where: { id } });

    // Get updated user
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// ============ DELETE USER (Admin only - Soft Delete) ============
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Cannot delete yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Soft delete - set inactive
    await User.update({ is_active: false }, { where: { id } });

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// ============ HARD DELETE USER (Admin only) ============
export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Cannot delete yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Hard delete
    await User.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "User permanently deleted successfully",
    });
  } catch (error) {
    console.error("Hard delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error permanently deleting user",
      error: error.message,
    });
  }
};

// ============ GET USER STATS (Admin only) ============
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: "student" } });
    const totalTrainers = await User.count({ where: { role: "trainer" } });
    const totalAdmins = await User.count({ where: { role: "admin" } });
    const activeUsers = await User.count({ where: { is_active: true } });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        roles: {
          student: totalStudents,
          trainer: totalTrainers,
          admin: totalAdmins,
        },
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};
