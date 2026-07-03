import db from "../models/index.js";

const { Module, Course, Lesson } = db;

// ============ CREATE MODULE (Trainer/Admin) ============
export const createModule = async (req, res) => {
  try {
    const { course_id, title, description, order } = req.body;

    // Validate required fields
    if (!course_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Course ID and title are required",
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

    // Check permission: only trainer who created the course or admin can add modules
    if (req.user.role !== "admin" && course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only add modules to your own courses",
      });
    }

    // If no order provided, get the next order number
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await Module.findOne({
        where: { course_id },
        order: [["order", "DESC"]],
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 0;
    }

    // Create module
    const module = await Module.create({
      course_id,
      title,
      description: description || null,
      order: moduleOrder,
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: { module },
    });
  } catch (error) {
    console.error("Create module error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating module",
      error: error.message,
    });
  }
};

// ============ GET MODULES BY COURSE ============
export const getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const modules = await Module.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: Lesson,
          as: "lessons",
          order: [["order", "ASC"]],
        },
      ],
      order: [["order", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: { modules },
    });
  } catch (error) {
    console.error("Get modules error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching modules",
      error: error.message,
    });
  }
};

// ============ GET MODULE BY ID ============
export const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "trainer_id"],
        },
        {
          model: Lesson,
          as: "lessons",
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { module },
    });
  } catch (error) {
    console.error("Get module error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching module",
      error: error.message,
    });
  }
};

// ============ UPDATE MODULE (Trainer/Admin) ============
export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    // Check if module exists
    const module = await Module.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["trainer_id"],
        },
      ],
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Check permission
    if (req.user.role !== "admin" && module.course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update modules in your own courses",
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (order !== undefined) updates.order = order;

    // Update module
    await Module.update(updates, { where: { id } });

    // Get updated module
    const updatedModule = await Module.findByPk(id, {
      include: [
        {
          model: Lesson,
          as: "lessons",
          order: [["order", "ASC"]],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: { module: updatedModule },
    });
  } catch (error) {
    console.error("Update module error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating module",
      error: error.message,
    });
  }
};

// ============ DELETE MODULE (Trainer/Admin) ============
export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if module exists
    const module = await Module.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["trainer_id"],
        },
      ],
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Check permission
    if (req.user.role !== "admin" && module.course.trainer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete modules from your own courses",
      });
    }

    // Delete module (cascade will delete lessons)
    await Module.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Delete module error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting module",
      error: error.message,
    });
  }
};
