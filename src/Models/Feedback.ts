import { IsEnum, Length } from "class-validator";
import { feedbackTypeEnum } from "../config";

export class Feedback {
    @IsEnum(feedbackTypeEnum)
    feedback_type: string;

    @Length(5,500)
    feedback: string;
}