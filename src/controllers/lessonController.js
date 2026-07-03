import db from "../models/index.js";

const { Lesson, Module, Course } = db;

// ============ CREATE LESSON (Trainer/Admin) ============
export const createLesson = async (req, res) => {
  try {
    const { module_id, title, content, video_url, duration, order } = req.body;

    // Validate required fields
    if (!module_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Module ID and title are required",
      });
    }

    // Check if module exists
    const module = await Module.findByPk(module_id, {
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
        message: "You can only add lessons to your own courses",
      });
    }

    // If no order provided, get the next order number
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const lastLesson = await Lesson.findOne({
        where: { module_id },
        order: [["order", "DESC"]],
      });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
    }

    // Create lesson
    const lesson = await Lesson.create({
      module_id,
      title,
      content: content || null,
      video_url: video_url || null,
      duration: duration || 0,
      order: lessonOrder,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: { lesson },
    });
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating lesson",
      error: error.message,
    });
  }
};

// ============ GET LESSONS BY MODULE ============
export const getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Check if module exists
    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const lessons = await Lesson.findAll({
      where: { module_id: moduleId },
      order: [["order", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: { lessons },
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lessons",
      error: error.message,
    });
  }
};

// ============ GET LESSON BY ID ============
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Module,
          as: "module",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title", "trainer_id"],
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lesson",
      error: error.message,
    });
  }
};

// ============ UPDATE LESSON (Trainer/Admin) ============
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, duration, order } = req.body;

    // Check if lesson exists
    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Module,
          as: "module",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["trainer_id"],
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Check permission
    if (
      req.user.role !== "admin" &&
      lesson.module.course.trainer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update lessons in your own courses",
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (video_url !== undefined) updates.video_url = video_url;
    if (duration !== undefined) updates.duration = duration;
    if (order !== undefined) updates.order = order;

    // Update lesson
    await Lesson.update(updates, { where: { id } });

    // Get updated lesson
    const updatedLesson = await Lesson.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: { lesson: updatedLesson },
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lesson",
      error: error.message,
    });
  }
};

// ============ DELETE LESSON (Trainer/Admin) ============
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lesson exists
    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Module,
          as: "module",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["trainer_id"],
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Check permission
    if (
      req.user.role !== "admin" &&
      lesson.module.course.trainer_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete lessons from your own courses",
      });
    }

    // Delete lesson
    await Lesson.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting lesson",
      error: error.message,
    });
  }
};
