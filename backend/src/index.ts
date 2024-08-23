import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';

// interface CustomJwtPayload {
//   id: string;
// }

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId?: string;
  };
}>();

app.use('/api/v1/blog/*', async (c, next) => {
  const jwt = c.req.header('Authorization');
  if (!jwt) {
    c.status(401);
    return c.json({ error: 'unauthorized' });
  }

  const token = jwt.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);

    // // Ensure payload is an object and contains the 'id' field
    // if (payload && typeof payload === 'object' && 'id' in payload) {
    //   c.set('userId', (payload as { id: string }).id);
    //   await next();
    // } else {
    //   c.status(401);
    //   return c.json({ error: 'unauthorized' });
    // }
    //_____________________________________________

    if(!payload){
      c.status(401);
      return c.json({ error: 'unauthorized' });
    }
    c.set('userId', (payload as { id: string}).id);
    await next();
  } catch (e) {
    c.status(401);
    return c.json({ error: 'unauthorized' });
  }
});



app.post('/api/v1/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	})

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

app.post('/api/v1/signin', async(c) => {
	const prisma =new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL    ,
	}).$extends(withAccelerate());

	const body = await c.req.json();

	const user =await prisma.user.findUnique({
		where: {
            email: body.email,
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

app.get('/api/v1/blog/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {
		//console.log(c.get('userId'))
	return c.text('signin route')
})

app.put('/api/v1/blog', (c) => {
	return c.text('signin route')
})

export default app;
