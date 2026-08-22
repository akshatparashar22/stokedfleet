import { Router, type Request, type Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { comparePassword, generateToken, hashPassword } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
const prisma = new PrismaClient();

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const validRole = Object.values(Role).includes(role) ? role : Role.DRIVER;

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: validRole,
        settings: {
          create: {
            theme: 'LIGHT',
            liveData: true,
            pollingInterval: 5000,
            autoRefresh: true
          }
        }
      },
    });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { settings: true }
    });
    if (!user) {
      res.status(401).json({ error: 'Error: User not found' });
      return;
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
