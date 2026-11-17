import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
app.listen(env.PORT, () => console.log(`Fiori API escuchando en el puerto ${env.PORT}`));
