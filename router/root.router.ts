import { FastifyInstance, RouteOptions } from "fastify";
import router from "../utils/router";
import { ping } from "../controller/root/root.controller";
import { getUsers, userLogin } from "../controller/user/user.controller";

const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/ping",
    handler: ping.handler,
  },
  {
    method: "GET",
    url: "/getUsers",
    //  preHandler: [signToken],
    handler: getUsers.handler,
  },
  {
    method: "POST",
    url: "/login",
    handler: userLogin.handler,
  },
];

const rootRouter = (app: FastifyInstance) => {
  router(app, routes, "");
};

export { rootRouter };
