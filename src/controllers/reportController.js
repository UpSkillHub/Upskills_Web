import db from "../models/index.js";

const { Report, User, Course, Enrollment } = db;

// ============ SUBMIT REPORT (Student) ============
export const submitReport = async (req, res) => {
  try {
    const { course_id, title, content } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!course_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Course ID, title, and content are required",
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

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        user_id,
        course_id,
        status: "active",
      },
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "You must be enrolled in this course to submit a report",
      });
    }

    // Create report
    const report = await Report.create({
      user_id,
      course_id,
      title,
      content,
      status: "submitted",
      submitted_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { report },
    });
  } catch (error) {
    console.error("Submit report error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting report",
      error: error.message,
    });
  }
};

// ============ GET USER REPORTS ============
export const getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check permission
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own reports",
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

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "trainer_id"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// ============ GET COURSE REPORTS (Trainer/Admin) ============
export const getCourseReports = async (req, res) => {
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

    // Check permission
    if (req.user.role !== "admin" && course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view reports for your own courses",
      });
    }

    // Build filter
    const where = { course_id: courseId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: reports } = await Report.findAndCountAll({
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
      order: [["submitted_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get course reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course reports",
      error: error.message,
    });
  }
};

// ============ GET REPORT BY ID ============
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "profile_picture"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "trainer_id"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check permission
    const isOwner = report.user_id === req.user.id;
    const isTrainer =
      req.user.role === "trainer" && report.course.trainer_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isTrainer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

// ============ UPDATE REPORT (Student - only if draft) ============
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Check if report exists
    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check permission: only the author can update
    if (report.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reports",
      });
    }

    // Check if report can be updated (only draft or submitted can be updated)
    if (report.status === "reviewed" || report.status === "approved") {
      return res.status(400).json({
        success: false,
        message: `Report cannot be updated because it is ${report.status}`,
      });
    }

    // Build update object
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;

    await Report.update(updates, { where: { id } });

    // Get updated report
    const updatedReport = await Report.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: { report: updatedReport },
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating report",
      error: error.message,
    });
  }
};

// ============ REVIEW REPORT (Trainer/Admin) ============
export const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer_comment } = req.body;

    // Validate status
    if (!status || !["reviewed", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be reviewed, approved, or rejected",
      });
    }

    // Check if report exists
    const report = await Report.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["trainer_id"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check permission
    if (req.user.role !== "admin" && report.course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only review reports for your own courses",
      });
    }

    // Update report
    await Report.update(
      {
        status,
        reviewer_comment: reviewer_comment || null,
        reviewed_at: new Date(),
      },
      { where: { id } },
    );

    // Get updated report
    const updatedReport = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Report ${status} successfully`,
      data: { report: updatedReport },
    });
  } catch (error) {
    console.error("Review report error:", error);
    res.status(500).json({
      success: false,
      message: "Error reviewing report",
      error: error.message,
    });
  }
};

// ============ GET REPORT STATS (Trainer/Admin) ============
export const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.count();
    const submittedReports = await Report.count({
      where: { status: "submitted" },
    });
    const reviewedReports = await Report.count({
      where: { status: "reviewed" },
    });
    const approvedReports = await Report.count({
      where: { status: "approved" },
    });
    const rejectedReports = await Report.count({
      where: { status: "rejected" },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalReports,
        submitted: submittedReports,
        reviewed: reviewedReports,
        approved: approvedReports,
        rejected: rejectedReports,
      },
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report statistics",
      error: error.message,
    });
  }
};
