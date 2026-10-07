import { z } from "zod";
import {
  PERSONAL_INFO_MESSAGE,
  THREAT_CATEGORIES,
  THREAT_CHANNELS,
  containsPersonalInfo,
} from "./model";

// Lives apart from model.ts so pages that only display threats don't download zod.
export const threatReportSchema = z
  .object({
    category: z.enum(THREAT_CATEGORIES, {
      errorMap: () => ({ message: "Chọn thủ đoạn Deepfake" }),
    }),
    channel: z.enum(THREAT_CHANNELS, { errorMap: () => ({ message: "Chọn kênh bạn gặp phải" }) }),
    regionCode: z.string().min(1, "Chọn khu vực"),
    title: z
      .string()
      .trim()
      .min(5, "Tiêu đề cần ít nhất 5 ký tự")
      .max(120, "Tiêu đề tối đa 120 ký tự"),
    description: z
      .string()
      .trim()
      .min(20, "Mô tả cần ít nhất 20 ký tự")
      .max(1500, "Mô tả tối đa 1500 ký tự"),
    danger: z.number().int().min(1, "Chọn mức độ nguy hiểm").max(5),
  })
  .superRefine((value, ctx) => {
    if (containsPersonalInfo(`${value.title} ${value.description}`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: PERSONAL_INFO_MESSAGE,
      });
    }
  });

export type ThreatReportInput = z.infer<typeof threatReportSchema>;
