import { IsEnum, MinLength } from "class-validator";
import { feedbackTypeEnum } from "../config";

export class Feedback {
    @IsEnum(feedbackTypeEnum, { message: "Invalid Feedback!" })
    feedback_type: string;

    @MinLength(5, { message: "Feedback is too short" })
    feedback: string;
}