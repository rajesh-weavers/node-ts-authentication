import express from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get(
    "/users",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isAuthenticated(req, res, next).then(() => {});
    },
    getAllUsers as (req: express.Request, res: express.Response) => void
  );

  router.delete(
    "/users/:id",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isAuthenticated(req, res, next).then(() => {});
    },
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isOwner(req, res, next).then(() => {});
    },
    deleteUser as (req: express.Request, res: express.Response) => void
  );

  router.patch(
    "/users/:id",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isAuthenticated(req, res, next).then(() => {});
    },
    updateUser as (req: express.Request, res: express.Response) => void
  );
};
