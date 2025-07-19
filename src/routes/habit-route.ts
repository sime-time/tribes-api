import { Hono } from "hono";
import { createHabit, deleteHabit, getUserHabits } from "../controllers/habit-controller";

const router = new Hono();

router.post("/create", createHabit);
router.delete("/delete/:id", deleteHabit);
router.get("/user/:userId", getUserHabits);

export default router;
