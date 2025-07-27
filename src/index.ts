import { Logger } from "./utils/logger";
import { app } from "./app";

const PORT = process.env.PORT || 3000;
const logger = new Logger();
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
