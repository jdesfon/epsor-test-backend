import { Container } from 'typedi';
import express, { Request, Response, NextFunction } from 'express';
import HttpStatusCode from 'http-status-codes';
import { ApolloServer } from 'apollo-server-express';
import { ApplicationServiceProvider } from '../providers/ApplicationServiceProvider';
import { ProductResolver } from '../modules/product';
import { buildSchema } from 'type-graphql';

export interface IWebProcessConfig {
  port: number;
}

export class AbstractWebProcess {
  private _app: express.Application;
  private _server: ApolloServer;
  protected _serviceProvider: ApplicationServiceProvider;
  private _webProcessConfig: IWebProcessConfig;

  constructor(serviceProvider: ApplicationServiceProvider, webProcessConfig: IWebProcessConfig) {
    this._webProcessConfig = webProcessConfig;
    this._serviceProvider = serviceProvider;
  }

  protected async start() {
    Container.set('serviceProvider', this._serviceProvider);

    const schema = await buildSchema({
      resolvers: [ProductResolver],
      container: Container,
    });

    this._app = express();

    this._server = new ApolloServer({ schema });

    this._server.applyMiddleware({ app: this._app });

    this.serverPreConfig();

    this.serverPostConfig();

    this._app.listen({ port: this._webProcessConfig.port }, () => {
      this._serviceProvider.logger.info(`🚀 Server listening on port ${this._webProcessConfig.port}`);
      this._serviceProvider.logger.info(`http://localhost:${this._webProcessConfig.port}${this._server.graphqlPath}`);
    });
  }

  protected async stop() {
    this._server.stop();
  }

  private serverPreConfig() {
    this._app.get('/status', (req, res, next) => {
      res.sendStatus(HttpStatusCode.OK);
    });
  }

  private serverPostConfig() {
    this._app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        return res.status(err.status).send({ message: err.message }).end();
      }
      return next(err);
    });

    this._app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res.status(err.status || 500);
      res.json({
        errors: {
          message: err.message,
        },
      });
    });
  }
}
