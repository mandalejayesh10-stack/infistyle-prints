"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    usersService;
    jwtService;
    constructor(prisma, usersService, jwtService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async generateAuthTokens(user) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                userId: user.id,
                expiresAt,
            },
        });
        return {
            access_token: accessToken,
            refresh_token: rawRefreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                company_name: user.companyName || '',
                gstin: user.gstin || '',
                billing_address: user.billingAddress || '',
                shipping_address: user.shippingAddress || '',
                profile_photo: user.profilePhoto || '',
                is_email_verified: user.isEmailVerified,
            },
        };
    }
    async register(data) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) {
            throw new common_1.ConflictException('A user with this email address already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.passwordHash, salt);
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: 'customer',
                isEmailVerified: false,
            },
        });
        return this.generateAuthTokens(user);
    }
    async login(email, passwordHash) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid login credentials');
        }
        if (user.isDisabled) {
            throw new common_1.UnauthorizedException('This account has been disabled. Please contact support.');
        }
        const isValidPassword = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isValidPassword) {
            throw new common_1.UnauthorizedException('Invalid login credentials');
        }
        return this.generateAuthTokens(user);
    }
    async rotateTokens(refreshTokenId, user) {
        await this.prisma.refreshToken.delete({ where: { id: refreshTokenId } }).catch(() => { });
        return this.generateAuthTokens(user);
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            await this.prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => { });
        }
        return { success: true };
    }
    async validateOrCreateGoogleUser(googleProfile) {
        let user = await this.usersService.findByGoogleId(googleProfile.googleId);
        if (!user) {
            user = await this.usersService.findByEmail(googleProfile.email);
            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: googleProfile.googleId, profilePhoto: googleProfile.profilePhoto },
                });
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        googleId: googleProfile.googleId,
                        email: googleProfile.email,
                        name: googleProfile.name,
                        profilePhoto: googleProfile.profilePhoto,
                        role: 'customer',
                        isEmailVerified: true,
                    },
                });
            }
        }
        if (user.isDisabled) {
            throw new common_1.UnauthorizedException('This account has been disabled.');
        }
        return this.generateAuthTokens(user);
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { success: true, message: 'If the email exists, a reset link has been logged.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }).catch(() => { });
        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?mode=reset_password&token=${resetToken}`;
        console.log(`\n============================================================`);
        console.log(`📧 [EMAIL ALERTS / PASSWORD RESET]`);
        console.log(`To: ${user.name} <${user.email}>`);
        console.log(`Subject: Password Reset Request for InfiStyle`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`============================================================\n`);
        return { success: true, reset_token: resetToken };
    }
    async resetPassword(resetToken, newPasswordHash) {
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const storedToken = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await this.prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
            }
            throw new common_1.UnauthorizedException('Invalid or expired password reset token');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPasswordHash, salt);
        await this.prisma.user.update({
            where: { id: storedToken.userId },
            data: { passwordHash },
        });
        await this.prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map