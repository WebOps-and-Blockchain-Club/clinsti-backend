import { IsEmail, IsOptional, MinLength, NotContains } from "class-validator";

export class SignUP {
    @MinLength(3, { message: "Username is too short" })
    name: string;

    @IsEmail({}, { message: "Invalid Email!" })
    email: string;

    @MinLength(5, { message: "Enter strong password" })
    @NotContains("password", { message: "Enter strong password" })
    @NotContains("Password", { message: "Enter strong password" })
    @NotContains("PASSWORD", { message: "Enter strong password" })
    password: string;
}

export class SignIN {
    @IsEmail({}, { message: "Invalid Email!" })
    email: string;

    password: string;
}

export class EditProfile {
    @MinLength(3, { message: "Username is too short" })
    @IsOptional()
    name: string;

    @IsEmail({}, { message: "Invalid Email!" })
    @IsOptional()
    email: string;
}

export class ChangePassword {
    oldPassword: string;

    @MinLength(5, { message: "Enter strong password" })
    @NotContains("password", { message: "Enter strong password" })
    @NotContains("Password", { message: "Enter strong password" })
    @NotContains("PASSWORD", { message: "Enter strong password" })
    newPassword: string;
}