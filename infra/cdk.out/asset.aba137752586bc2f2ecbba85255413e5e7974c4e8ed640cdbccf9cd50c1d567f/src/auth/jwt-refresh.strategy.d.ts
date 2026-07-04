import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(req: Request, payload: {
        sub: string;
        email: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            googleId: string | null;
            name: string;
            passwordHash: string | null;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            companyName: string | null;
            gstin: string | null;
            billingAddress: string | null;
            shippingAddress: string | null;
            profilePhoto: string | null;
            isEmailVerified: boolean;
            isDisabled: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        refreshTokenId: string;
    }>;
}
export {};
