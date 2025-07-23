import express from "express";
import { errorHandler } from "./utils/errorHandler";
import { AdController } from "./controllers/adController";
import { AdService } from "./services/AdService";
import { OpenAIProvider } from "./core/OpenAIProvider";
import logger from "./utils/logger";

const openaiProvider = new OpenAIProvider(logger);
const adService = new AdService(openaiProvider, logger);
const adController = new AdController(adService, logger);

const app = express();

app.use(express.json());
app.post("/api/ads", adController.generateAdFromPrompt.bind(adController));
app.use(errorHandler);

export { app };
