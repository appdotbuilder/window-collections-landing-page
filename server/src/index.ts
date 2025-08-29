import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schema types
import { 
  createWindowCollectionInputSchema,
  updateWindowCollectionInputSchema,
  createWindowInputSchema,
  updateWindowInputSchema
} from './schema';

// Import handlers
import { createWindowCollection } from './handlers/create_window_collection';
import { getWindowCollections } from './handlers/get_window_collections';
import { getWindowCollectionById } from './handlers/get_window_collection_by_id';
import { updateWindowCollection } from './handlers/update_window_collection';
import { deleteWindowCollection } from './handlers/delete_window_collection';
import { createWindow } from './handlers/create_window';
import { getWindowsByCollection } from './handlers/get_windows_by_collection';
import { updateWindow } from './handlers/update_window';
import { deleteWindow } from './handlers/delete_window';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Window Collection routes
  createWindowCollection: publicProcedure
    .input(createWindowCollectionInputSchema)
    .mutation(({ input }) => createWindowCollection(input)),

  getWindowCollections: publicProcedure
    .query(() => getWindowCollections()),

  getWindowCollectionById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getWindowCollectionById(input.id)),

  updateWindowCollection: publicProcedure
    .input(updateWindowCollectionInputSchema)
    .mutation(({ input }) => updateWindowCollection(input)),

  deleteWindowCollection: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteWindowCollection(input.id)),

  // Window routes
  createWindow: publicProcedure
    .input(createWindowInputSchema)
    .mutation(({ input }) => createWindow(input)),

  getWindowsByCollection: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(({ input }) => getWindowsByCollection(input.collectionId)),

  updateWindow: publicProcedure
    .input(updateWindowInputSchema)
    .mutation(({ input }) => updateWindow(input)),

  deleteWindow: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteWindow(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
        credentials: true,
      })(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log(`Window Seller API ready for requests`);
}

start();