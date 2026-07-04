import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: {
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
    login(body: {
        email: string;
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
    refresh(req: any): Promise<{
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
    logout(body: {
        refresh_token?: string;
    }): Promise<{
        success: boolean;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
        reset_token?: undefined;
    } | {
        success: boolean;
        reset_token: string;
        message?: undefined;
    }>;
    resetPassword(body: {
        token: string;
        passwordHash: string;
    }): Promise<{
        success: boolean;
    }>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: any): Promise<void>;
    googleSimulatedLogin(body: {
        email?: string;
        name?: string;
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
}
