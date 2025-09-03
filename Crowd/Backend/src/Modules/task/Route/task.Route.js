import { Router } from "express";
import {listTasks,getTask,createTask,updateTask,deleteTask} from "../Controller/task.controller.js";

const router = Router();

router.route("/")
  .get(listTasks)   // GET /api/tasks
  .post(createTask); // POST /api/tasks

router.route("/:id")
  .get(getTask)      // GET /api/tasks/:id
  .put(updateTask)   // PUT /api/tasks/:id
  .delete(deleteTask); // DELETE /api/tasks/:id

export default router;
