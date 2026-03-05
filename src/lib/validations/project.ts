import * as z from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  status: z.enum(["active", "on-hold", "completed", "cancelled"], {
    message: "Status is required",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    message: "Priority is required",
  }),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  team_members: z.array(z.string()),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "End date cannot be earlier than start date",
  path: ["end_date"],
});

export type ProjectValues = z.infer<typeof projectSchema>;
