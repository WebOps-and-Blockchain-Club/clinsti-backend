import { IsEnum, IsInt, IsOptional, Length, Max, Min } from "class-validator";
import { statusEnum, wasteTypeEnum, zoneEnum } from "../config";

export class NewComplaint {
    
    @Length(5,100)
    description: string;

    @Length(5,50)
    location: string;

    @IsEnum(zoneEnum)
    zone: string;

    @IsEnum(wasteTypeEnum)
    wasteType: string;
}

export class ComplaintFeedback {
    @IsInt()
    @Min(1)
    @Max(5)
    fbRating: number;

    @Length(5,100)
    @IsOptional()
    fbRemark: string;
}

export class StatusUpdate {
    @IsEnum(statusEnum)
    status: string;

    @IsOptional()
    @Length(2,200)
    remark: string;
}