import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', message: 'Fiori API funcionando' });
});

app.listen(port, () => {
  console.log(`Fiori API escuchando en el puerto ${port}`);
});
