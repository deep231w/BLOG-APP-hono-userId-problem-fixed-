import { verify } from "hono/jwt";
import { Context } from "hono";

export const AuthMiddleware = async (c: Context, next: () => Promise<void>) => {
  const jwt = c.req.header('Authorization') || " ";
  const token = jwt.split(' ')[1];

  try {
    const user = await verify(token, c.env.JWT_SECRET);

    if (user) {
      // Set the userId in the context as a custom header
      c.set('userId', user.id as string);
      await next();
    } else {
      c.status(401);
      return c.json({ error: 'unauthorized' });
    }
  } catch (error) {
    c.status(401);
    return c.json({ error: 'invalid token' });
  }
};