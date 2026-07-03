import db from "../models/index.js";

const { Enrollment, Course, User, Payment } = db;

// ============ ENROLL IN COURSE (Student) ============
export const enrollInCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is published
    if (!course.is_published) {
      return res.status(400).json({
        success: false,
        message: "This course is not yet published",
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { user_id, course_id },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Check if user has paid (if course has price)
    if (parseFloat(course.price) > 0) {
      const payment = await Payment.findOne({
        where: {
          user_id,
          course_id,
          status: "completed",
        },
      });

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Payment required. Please complete payment first",
        });
      }
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user_id,
      course_id,
      status: "active",
      progress: 0,
      enrolled_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: { enrollment },
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling in course",
      error: error.message,
    });
  }
};

// ============ GET USER ENROLLMENTS ============
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check permission
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own enrollments",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build filter
    const where = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          include: [
            {
              model: User,
              as: "trainer",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["enrolled_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollments",
      error: error.message,
    });
  }
};

// ============ GET COURSE ENROLLMENTS (Trainer/Admin) ============
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check permission: only trainer who created it or admin can view
    if (req.user.role !== "admin" && course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view enrollments for your own courses",
      });
    }

    // Build filter
    const where = { course_id: courseId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "profile_picture"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["enrolled_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get course enrollments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course enrollments",
      error: error.message,
    });
  }
};

// ============ UPDATE ENROLLMENT PROGRESS ============
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["trainer_id"],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check permission: student can update their own progress, trainer can update all
    if (req.user.role === "student" && enrollment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own progress",
      });
    }

    if (
      req.user.role === "trainer" &&
      enrollment.course.trainer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update progress for your own courses",
      });
    }

    // Validate progress (0-100)
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    // Update progress
    const updates = { progress };
    if (progress === 100) {
      updates.status = "completed";
      updates.completed_at = new Date();
    }

    await Enrollment.update(updates, { where: { id } });

    // Get updated enrollment
    const updatedEnrollment = await Enrollment.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: { enrollment: updatedEnrollment },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    });
  }
};

// ============ UNENROLL FROM COURSE (Student) ============
export const unenrollFromCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check permission: students can only unenroll themselves
    if (enrollment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only unenroll yourself",
      });
    }

    // Update status to dropped
    await Enrollment.update({ status: "dropped" }, { where: { id } });

    res.status(200).json({
      success: true,
      message: "Successfully unenrolled from course",
    });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({
      success: false,
      message: "Error unenrolling from course",
      error: error.message,
    });
  }
};

// ============ GET ENROLLMENT STATS (Admin/Trainer) ============
export const getEnrollmentStats = async (req, res) => {
  try {
    const totalEnrollments = await Enrollment.count();
    const activeEnrollments = await Enrollment.count({
      where: { status: "active" },
    });
    const completedEnrollments = await Enrollment.count({
      where: { status: "completed" },
    });
    const droppedEnrollments = await Enrollment.count({
      where: { status: "dropped" },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        dropped: droppedEnrollments,
      },
    });
  } catch (error) {
    console.error("Get enrollment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollment statistics",
      error: error.message,
    });
  }
};
