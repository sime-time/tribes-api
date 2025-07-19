import { Hono } from "hono";
import { createHabit } from "../controllers/habit-controller";

const router = new Hono();

router.post("/create", createHabit);

export default router;
