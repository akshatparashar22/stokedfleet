import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health-check', (req: Request, res: Response) => {
  res.json({ message: 'backend says hello' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
