import db from "../models/index.js";

const { Course, Module, Lesson, User, Enrollment } = db;

// ============ CREATE COURSE (Trainer/Admin) ============
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, is_published } = req.body;
    const trainer_id = req.user.id;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    // Check if user is a trainer or admin
    if (req.user.role !== "trainer" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only trainers and admins can create courses",
      });
    }

    // Create course
    const course = await Course.create({
      title,
      description: description || null,
      trainer_id,
      price: price || 0.0,
      is_published: is_published || false,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: { course },
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message,
    });
  }
};

// ============ GET ALL COURSES ============
export const getAllCourses = async (req, res) => {
  try {
    const { is_published, page = 1, limit = 10 } = req.query;

    // Build filter
    const where = {};
    if (is_published !== undefined) {
      where.is_published = is_published === "true";
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get courses with trainer info
    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email", "profile_picture"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// ============ GET COURSE BY ID ============
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email", "profile_picture"],
        },
        {
          model: Module,
          as: "modules",
          include: [
            {
              model: Lesson,
              as: "lessons",
              order: [["order", "ASC"]],
            },
          ],
          order: [["order", "ASC"]],
        },
        {
          model: Enrollment,
          as: "enrollments",
          attributes: ["id", "user_id", "status", "progress"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Count total enrollments
    const enrollmentCount = await Enrollment.count({
      where: { course_id: id, status: "active" },
    });

    const response = {
      ...course.toJSON(),
      enrollment_count: enrollmentCount,
    };

    res.status(200).json({
      success: true,
      data: { course: response },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message,
    });
  }
};

// ============ UPDATE COURSE (Trainer/Admin) ============
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, is_published } = req.body;

    // Check if course exists
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check permission
    if (req.user.role !== "admin" && course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (is_published !== undefined) updates.is_published = is_published;

    // Update course
    await Course.update(updates, { where: { id } });

    // Get updated course
    const updatedCourse = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email", "profile_picture"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: { course: updatedCourse },
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating course",
      error: error.message,
    });
  }
};

// ============ DELETE COURSE (Trainer/Admin) ============
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check permission
    if (req.user.role !== "admin" && course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own courses",
      });
    }

    // Delete course (cascade will delete modules and lessons)
    await Course.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting course",
      error: error.message,
    });
  }
};

// ============ GET COURSES BY TRAINER ============
export const getCoursesByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if trainer exists
    const trainer = await User.findByPk(trainerId);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows: courses } = await Course.findAndCountAll({
      where: { trainer_id: trainerId },
      include: [
        {
          model: User,
          as: "trainer",
          attributes: ["id", "name", "email", "profile_picture"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get trainer courses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trainer courses",
      error: error.message,
    });
  }
};
