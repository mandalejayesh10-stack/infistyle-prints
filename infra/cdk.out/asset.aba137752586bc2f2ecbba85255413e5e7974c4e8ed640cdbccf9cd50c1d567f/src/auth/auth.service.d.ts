import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private prisma;
    private usersService;
    private jwtService;
    constructor(prisma: PrismaService, usersService: UsersService, jwtService: JwtService);
    generateAuthTokens(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            company_name: any;
            gstin: any;
            billing_address: any;
            shipping_address: any;
            profile_photo: any;
            is_email_verified: any;
        };
    }>;
    register(data: {
        email: string;
        name: string;
        passwordHash: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            company_name: any;
            gstin: any;
            billing_address: any;
            shipping_address: any;
            profile_photo: any;
            is_email_verified: any;
        };
    }>;
    login(email: string, passwordHash: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            company_name: any;
            gstin: any;
            billing_address: any;
            shipping_address: any;
            profile_photo: any;
            is_email_verified: any;
        };
    }>;
    rotateTokens(refreshTokenId: string, user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            company_name: any;
            gstin: any;
            billing_address: any;
            shipping_address: any;
            profile_photo: any;
            is_email_verified: any;
        };
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    validateOrCreateGoogleUser(googleProfile: {
        googleId: string;
        email: string;
        name: string;
        profilePhoto: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            company_name: any;
            gstin: any;
            billing_address: any;
            shipping_address: any;
            profile_photo: any;
            is_email_verified: any;
        };
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
        reset_token?: undefined;
    } | {
        success: boolean;
        reset_token: string;
        message?: undefined;
    }>;
    resetPassword(resetToken: string, newPasswordHash: string): Promise<{
        success: boolean;
    }>;
}
