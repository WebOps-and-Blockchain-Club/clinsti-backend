import { IsEmail, IsOptional, Length, MinLength, NotContains } from "class-validator";

export class SignUP {
    @Length(5,10)
    name: string;

    @IsEmail()
    email: string;

    @MinLength(5)
    @NotContains("password")
    @NotContains("Password")
    @NotContains("PASSWORD")
    password: string;
}

export class SignIN {
    @IsEmail()
    email: string;

    password: string;
}

export class EditProfile {
    @Length(5,10)
    @IsOptional()
    name: string;

    @IsEmail()
    @IsOptional()
    email: string;
}

export class ChangePassword {
    oldPassword: string;

    @MinLength(5)
    @NotContains("password")
    @NotContains("Password")
    @NotContains("PASSWORD")
    newPassword: string;
}