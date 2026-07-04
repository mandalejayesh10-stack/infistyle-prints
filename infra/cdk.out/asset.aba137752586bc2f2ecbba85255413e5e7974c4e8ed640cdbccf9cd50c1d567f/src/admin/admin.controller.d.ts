import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
export declare class AdminController {
    private usersService;
    constructor(usersService: UsersService);
    listUsers(): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        company_name: string;
        gstin: string;
        billing_address: string;
        shipping_address: string;
        is_email_verified: boolean;
        is_disabled: boolean;
        created_at: Date;
    }[]>;
    updateUserRole(id: string, body: {
        role: Role;
    }): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    updateUserStatus(id: string, body: {
        is_disabled: boolean;
    }): Promise<{
        id: string;
        is_disabled: boolean;
    }>;
}
