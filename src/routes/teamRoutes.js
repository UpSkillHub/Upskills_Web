import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  getTeamMembers,
  getTeamsByUser,
} from "../controllers/teamController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// ============ PROTECTED ROUTES ============
router.post("/", verifyToken, authorize("admin"), createTeam);
router.get("/", verifyToken, authorize("admin", "trainer"), getAllTeams);
router.get("/:id", verifyToken, authorize("admin", "trainer"), getTeamById);
router.put("/:id", verifyToken, authorize("admin"), updateTeam);
router.delete("/:id", verifyToken, authorize("admin"), deleteTeam);
router.post("/:id/members", verifyToken, authorize("admin"), addTeamMember);

// Remove member from team
router.delete(
  "/:id/members/:userId",
  verifyToken,
  authorize("admin"),
  removeTeamMember,
);

// Update member role
router.put(
  "/:id/members/:userId/role",
  verifyToken,
  authorize("admin"),
  updateMemberRole,
);

// Get team members
router.get(
  "/:id/members",
  verifyToken,
  authorize("admin", "trainer"),
  getTeamMembers,
);

// Teams by User (Admin/Trainer)
router.get(
  "/user/:userId",
  verifyToken,
  authorize("admin", "trainer"),
  getTeamsByUser,
);

export default router;
