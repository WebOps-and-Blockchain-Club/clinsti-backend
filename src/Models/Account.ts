import { IsEmail, MinLength, NotContains } from "class-validator";

export class SignUP {
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
    name: string;
}

export class ChangePassword {
    oldPassword: string;

    @MinLength(5, { message: "Enter strong password" })
    @NotContains("password", { message: "Enter strong password" })
    @NotContains("Password", { message: "Enter strong password" })
    @NotContains("PASSWORD", { message: "Enter strong password" })
    newPassword: string;
}

export class RequestOTP {
    @IsEmail({}, { message: "Invalid Email!" })
    email: string;
}

export class ResetPass {
    @IsEmail({}, { message: "Invalid Email!" })
    email: string;

    otp: string;

    @MinLength(5, { message: "Enter strong password" })
    @NotContains("password", { message: "Enter strong password" })
    @NotContains("Password", { message: "Enter strong password" })
    @NotContains("PASSWORD", { message: "Enter strong password" })
    password: string;
}