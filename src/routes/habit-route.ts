import { Hono } from "hono";
import { createHabit, deleteHabit } from "../controllers/habit-controller";

const router = new Hono();

router.post("/create", createHabit);
router.delete("/delete/:id", deleteHabit);

export default router;
