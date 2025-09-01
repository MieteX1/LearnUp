import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationService {
    private emailTemplates: { [key: string]: string } = {};

    constructor(
        private jwtService: JwtService,
        private readonly mailService: MailerService
    ) {
        this.loadEmailTemplates();
    }

    private loadEmailTemplates() {
        const templatesPath = path.join(__dirname, '../../src/templates/email-templates.html');
        const templateContent = fs.readFileSync(templatesPath, 'utf8');

        // Extract templates using regex
        const verificationTemplate = this.extractTemplate(templateContent, 'verification-email');
        const resetTemplate = this.extractTemplate(templateContent, 'reset-password');
        const moderatorTemplate = this.extractTemplate(templateContent, 'moderator-setup');

        this.emailTemplates = {
            verification: verificationTemplate,
            reset: resetTemplate,
            moderator: moderatorTemplate
        };
    }

    private extractTemplate(content: string, templateId: string): string {
        const regex = new RegExp(`<template id="${templateId}">(.*?)</template>`, 's');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    }

    private replaceTemplateVariables(template: string, variables: { [key: string]: string }): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }

    async sendVerivicationEmail(emailRecipient: string): Promise<void> {
        const payload = { email: emailRecipient };
        const verificationEmailToken = this.jwtService.sign(payload, {
            secret: process.env.VERIFIED_JWT_SECRET,
            expiresIn: process.env.VERIFIED_JWT_EXPIRE_IN,
        });

        const verificationLink = `http://localhost:${process.env.APP_PORT}/email-verify?token=${verificationEmailToken}`;

        const htmlContent = this.replaceTemplateVariables(
            this.emailTemplates.verification,
            { verificationLink }
        );

        await this.mailService.sendMail({
            from: process.env.DEFAULT_EMAIL_FROM,
            to: emailRecipient,
            subject: 'Verify Your Email Address',
            html: htmlContent,
        });
    }

    async sendResetEmail(email: string): Promise<void> {
        const payload = { email: email };
        const resetPasswordToken = this.jwtService.sign(payload, {
            secret: process.env.FORGOT_PASSWORD_JWT_SECRET,
            expiresIn: process.env.FORGOT_PASSWORD_JWT_EXPIRE_IN,
        });

        const resetLink = `http://localhost:${process.env.APP_PORT}/reset-password/?token=${resetPasswordToken}`;
        const htmlContent = this.replaceTemplateVariables(
            this.emailTemplates.reset,
            { resetLink }
        );

        await this.mailService.sendMail({
            from: process.env.DEFAULT_EMAIL_FROM,
            to: email,
            subject: 'Reset Your Password',
            html: htmlContent,
        });
    }

    async SetupPasswordEmail(email: string): Promise<void> {
        const payload = { email: email };
        const setupToken = this.jwtService.sign(payload, {
            secret: process.env.CREATE_MODERATOR_JWT_SECRET,
            expiresIn: process.env.CREATE_MODERATOR_JWT_EXPIRE_IN,
        });

        const setupLink = `http://localhost:${process.env.APP_PORT}${process.env.MODERATOR_REGISTER_URL}?token=${setupToken}`;
        const htmlContent = this.replaceTemplateVariables(
            this.emailTemplates.moderator,
            { setupLink }
        );

        await this.mailService.sendMail({
            from: process.env.DEFAULT_EMAIL_FROM,
            to: email,
            subject: 'Setup Your Moderator Account',
            html: htmlContent,
        });
    }
}