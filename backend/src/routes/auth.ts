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
        settings: {
          create: {
            theme: 'SYSTEM',
            liveData: true,
            pollingInterval: 5000,
            autoRefreshAnalytics: true,
            autoRefreshAlerts: true
          }
        }
      },
      include: { settings: true }
    });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({ id: user.id, username: user.username, role: user.role, settings: user.settings });
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

    const user = await prisma.user.findUnique({ 
      where: { username },
      include: { settings: true }
    });
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

    res.json({ id: user.id, username: user.username, role: user.role, settings: user.settings });
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

router.patch('/settings', authenticate, async (req: Request, res: Response) => {
  try {
    const { theme, pollingInterval, autoRefreshAnalytics, autoRefreshAlerts, liveData, widgets } = req.body;
    
    let updateData: any = {
      ...(theme !== undefined && { theme }),
      ...(pollingInterval !== undefined && { pollingInterval }),
      ...(autoRefreshAnalytics !== undefined && { autoRefreshAnalytics }),
      ...(autoRefreshAlerts !== undefined && { autoRefreshAlerts }),
      ...(liveData !== undefined && { liveData })
    };

    if (widgets !== undefined) {
      const existingSettings = await prisma.userSettings.findUnique({ where: { userId: req.user.id } });
      const currentWidgets = typeof existingSettings?.widgets === 'object' && existingSettings?.widgets !== null ? existingSettings.widgets : {};
      updateData.widgets = { ...(currentWidgets as object), ...widgets };
    }

    const settings = await prisma.userSettings.update({
      where: { userId: req.user.id },
      data: updateData
    });
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Incorrect current password' });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
