import { IsEnum, IsInt, IsOptional, Length, Max, Min } from "class-validator";
import { statusEnum, wasteTypeEnum, zoneEnum } from "../config";

export class NewComplaint {
    
    @Length(5,300)
    description: string;

    @Length(5,150)
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

    @Length(5,300)
    @IsOptional()
    fbRemark: string;
}

export class StatusUpdate {
    @IsEnum(statusEnum)
    status: string;

    @IsOptional()
    @Length(2,300)
    remark: string;
}