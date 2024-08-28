import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';

export const userRouter = new Hono<
{
    Bindings: {
            DATABASE_URL: string,
            JWT_SECRET: string
 }}>()

userRouter.post('/signup', async (c) => {
            
        })
         
userRouter.post('/signin', async(c) => {
            
        })
        