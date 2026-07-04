import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
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
    }>;
}
export {};
