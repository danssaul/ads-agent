import { NextFunction, Request, Response } from 'express';
import { AdService } from '../services/AdService';
import { AppError } from '../utils/AppError';
import asyncHandler from 'express-async-handler';

export class AdController {
    constructor(
        private readonly adService: AdService,
        private readonly logger: any
    ) { }

    generateAdFromPrompt = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { prompt } = req.body;
        this.logger.info(`Received ad generation request with prompt: ${prompt}`);

        if (!prompt || typeof prompt !== 'string') {
            this.logger.warn('Prompt validation failed.');
            return next(new AppError('Prompt must be a non-empty string.', 400));
        }

        try {
            const ad = await this.adService.generateAd(prompt);
            this.logger.info('Ad generated successfully.');
            res.json(ad);
        } catch (error) {
            this.logger.error(`Error generating ad: ${error}`);
            next(error);
        }
    });
}
