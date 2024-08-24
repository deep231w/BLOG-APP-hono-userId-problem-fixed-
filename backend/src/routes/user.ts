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
            const prisma = new PrismaClient({
                datasourceUrl: c.env?.DATABASE_URL	,
            }).$extends(withAccelerate());
        
            const body = await c.req.json();
            try {
                const user = await prisma.user.create({
                    data: {
                        email: body.email,
                        password: body.password,
                        name: body.name
                    }
                });
                const jwtSecret = c.env.JWT_SECRET;
            if (!jwtSecret) {
              console.error("JWT secret is not defined");
              c.status(500);
              return c.json({ error: "Internal server error" });
            }
        
            try {
              const jwt = await sign({ id: user.id }, jwtSecret);
              return c.json({ jwt });
            } catch (error) {
              console.error("JWT signing error:", error);
              c.status(500);
              return c.json({ error: "JWT signing failed" });
            }
            
          } catch (e) {
            console.error("Error while signing up:", e);
            c.status(403);
            return c.json({ error: "Error while signing up" });
          }
        
              
        })
        
userRouter.post('/signin', async(c) => {
            const prisma =new PrismaClient({
                datasourceUrl: c.env?.DATABASE_URL    ,
            }).$extends(withAccelerate());
        
            const body = await c.req.json();
        
            const user =await prisma.user.findUnique({
                where: {
                    email: body.email,
                    password: body.password,
                }
            })
            if (!user) {
                c.status(403);
                return c.json({ error: "Invalid credentials" });
                // throw new Error("Invalid credentials");  // Uncomment this line to throw an error instead of returning a JSON response.  This would result in a 500 HTTP status code.
            }
            console.log('jwt', c.env.JWT_SECRET)
            const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
            return c.json({ jwt });
        
        })
        