import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        rol_id: number;
    };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            req.user = decoded as { id: number; rol_id: number };
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
