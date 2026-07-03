import db from "../models/index.js";

const { Team, TeamMember, User, Course } = db;

// ============ CREATE TEAM (Admin only) ============
export const createTeam = async (req, res) => {
  try {
    const { name, description, course_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Check if course exists (if provided)
    if (course_id) {
      const course = await Course.findByPk(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    // Create team
    const team = await Team.create({
      name,
      description: description || null,
      created_by: req.user.id,
      course_id: course_id || null,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: { team },
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
};

// ============ GET ALL TEAMS ============
export const getAllTeams = async (req, res) => {
  try {
    const { course_id, is_active, page = 1, limit = 10 } = req.query;

    // Build filter
    const where = {};
    if (course_id) where.course_id = course_id;
    if (is_active !== undefined) where.is_active = is_active === "true";

    const offset = (page - 1) * limit;

    const { count, rows: teams } = await Team.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email", "profile_picture"],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        teams,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all teams error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message,
    });
  }
};

// ============ GET TEAM BY ID ============
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "profile_picture"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "trainer_id"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email", "profile_picture"],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { team },
    });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message,
    });
  }
};

// ============ UPDATE TEAM (Admin only) ============
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, course_id, is_active } = req.body;

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if course exists (if provided)
    if (course_id) {
      const course = await Course.findByPk(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (course_id !== undefined) updates.course_id = course_id;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update team
    await Team.update(updates, { where: { id } });

    // Get updated team
    const updatedTeam = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "email", "profile_picture"],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: { team: updatedTeam },
    });
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message,
    });
  }
};

// ============ DELETE TEAM (Admin only) ============
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Delete team (cascade will delete team members)
    await Team.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting team",
      error: error.message,
    });
  }
};

// ============ ADD MEMBER TO TEAM (Admin only) ============
export const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = "member" } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already a member
    const existingMember = await TeamMember.findOne({
      where: { team_id: id, user_id },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this team",
      });
    }

    // Add member to team
    const teamMember = await TeamMember.create({
      team_id: id,
      user_id,
      role,
      joined_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Member added to team successfully",
      data: { teamMember },
    });
  } catch (error) {
    console.error("Add team member error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding member to team",
      error: error.message,
    });
  }
};

// ============ REMOVE MEMBER FROM TEAM (Admin only) ============
export const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if member exists
    const teamMember = await TeamMember.findOne({
      where: { team_id: id, user_id: userId },
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this team",
      });
    }

    // Remove member
    await TeamMember.destroy({
      where: { team_id: id, user_id: userId },
    });

    res.status(200).json({
      success: true,
      message: "Member removed from team successfully",
    });
  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing member from team",
      error: error.message,
    });
  }
};

// ============ UPDATE MEMBER ROLE (Admin only) ============
export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !["lead", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "lead" or "member"',
      });
    }

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if member exists
    const teamMember = await TeamMember.findOne({
      where: { team_id: id, user_id: userId },
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this team",
      });
    }

    // Update role
    await TeamMember.update(
      { role },
      { where: { team_id: id, user_id: userId } },
    );

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: { team_id: id, user_id: userId, role },
    });
  } catch (error) {
    console.error("Update member role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating member role",
      error: error.message,
    });
  }
};

// ============ GET TEAM MEMBERS ============
export const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const members = await TeamMember.findAll({
      where: { team_id: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "profile_picture"],
        },
      ],
      order: [
        ["role", "DESC"],
        ["joined_at", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team members",
      error: error.message,
    });
  }
};

// ============ GET TEAMS BY USER ============
export const getTeamsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const teams = await Team.findAll({
      include: [
        {
          model: User,
          as: "members",
          where: { id: userId },
          attributes: [],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: { teams },
    });
  } catch (error) {
    console.error("Get user teams error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user teams",
      error: error.message,
    });
  }
};
