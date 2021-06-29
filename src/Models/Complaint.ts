import { IsEnum, IsInt, IsOptional, Length, Max, Min, MinLength } from "class-validator";
import { statusEnum, wasteTypeEnum, zoneEnum } from "../config";

export class NewComplaint {
    
    @MinLength(5, { message: "Description is too short" })
    description: string;

    @MinLength(5, { message: "Incomplete Location!" })
    location: string;

    @IsEnum(zoneEnum, { message: "Invalid Zone!" })
    zone: string;

    @IsEnum(wasteTypeEnum, { message: "Invalid Waste Type!" })
    wasteType: string;
}

export class ComplaintFeedback {
    @IsInt({ message: "Invalid Feedback Rating!" })
    @Min(1, { message: "Invalid Feedback Rating!" })
    @Max(5, { message: "Invalid Feedback Rating!" })
    fbRating: number;

    @Length(5,300)
    @IsOptional()
    fbRemark: string;
}

export class StatusUpdate {
    @IsEnum(statusEnum, { message: "Invalid Status!" })
    status: string;

    @IsOptional()
    @Length(5,300, { message: "Remark is too short" })
    remark: string;
}