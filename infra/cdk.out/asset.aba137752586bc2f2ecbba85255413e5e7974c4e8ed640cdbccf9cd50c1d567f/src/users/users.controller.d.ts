import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
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
    }>;
    updateProfile(req: any, body: {
        name?: string;
        phone?: string;
        companyName?: string;
        gstin?: string;
        billingAddress?: string;
        shippingAddress?: string;
        profilePhoto?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        company_name: string;
        gstin: string;
        billing_address: string;
        shipping_address: string;
        profile_photo: string;
        is_email_verified: boolean;
    }>;
}
