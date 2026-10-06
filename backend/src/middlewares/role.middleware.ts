import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (roles: number[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (roles.includes(req.user.rol_id)) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};
