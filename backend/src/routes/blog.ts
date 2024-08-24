import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono ,Context } from 'hono';
import { AuthMiddleware } from '../middleware/auth';

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  };
  Variables: {
    userId?: string,
  };
}>();
type CustomContext = Context & {
    get: (key: 'userId') => string | undefined;
  };

blogRouter.use('*', AuthMiddleware);

blogRouter.post('/', async (c: CustomContext) => {
  const body = await c.req.json();
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.JWT_SECRET,
  }).$extends(withAccelerate());

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId as string,
    },
  });

  return c.json({ id: blog.id });
});

//update blog
blogRouter.put('/', async(c) => {
	const prisma =  new PrismaClient({
        datasourceUrl: c.env.JWT_SECRET,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    try{
         await prisma.post.update({
             where: {
                 id: body.id
             },
             data: {
                 title: body.title,
                 content: body.content
             }
         })
         return c.json({
             message: 'Blog updated successfully'
         })
    }catch(e){
        console.error('Error while updating blog:', e);
        c.status(400);
        return c.json({ error: 'Error while updating blog' });
    }
})

blogRouter.get('/:id', async (c)=>{
    const prisma =  new PrismaClient({
        datasourceUrl: c.env.JWT_SECRET,
    }).$extends(withAccelerate())
    const param = c.req.param('id')
    try{
        const blog = await prisma.post.findUnique({
            where: {
                id: param
            }
        })
        if (!blog) {
            console.log('No blog found');
            return c.status(404)
        }
        return c.json(blog)
    }
    catch(e){
        console.error('Error while fetching blog:', e);
        c.status(500);
        return c.json({ error: 'Error while fetching blog' });
    }
})
blogRouter.get('/bulk',async (c) => {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.JWT_SECRET,
        }).$extends(withAccelerate())
        try{
            const blogs = await prisma.post.findMany();
            return c.json(blogs);
        }catch(e){
            console.error('Error while fetching blogs:', e);
            c.status(500);
            return c.json({ error: 'Error while fetching blogs' });
        }
})  