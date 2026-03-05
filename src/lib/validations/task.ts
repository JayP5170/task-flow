import * as z from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"], {
    message: "Status is required",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    message: "Priority is required",
  }),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  labels: z.string().optional(),
});

export type TaskValues = z.infer<typeof taskSchema>;
