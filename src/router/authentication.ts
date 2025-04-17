import express from "express";
import { login, logout, register } from "../controllers/authentication";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.post(
    "/auth/register",
    register as (req: express.Request, res: express.Response) => void
  );
  router.post(
    "/auth/login",
    login as (req: express.Request, res: express.Response) => void
  );

  router.post(
    "/logout",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isAuthenticated(req, res, next).then(() => {});
    },
    logout as (req: express.Request, res: express.Response) => void
  );
};
