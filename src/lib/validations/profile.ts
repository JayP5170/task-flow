import * as z from "zod";

export const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters").max(50, "Username is too long"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
