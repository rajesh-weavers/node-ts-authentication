import express from "express";
import {
  deleteUser,
  getAllUsers,
  updateUser,
  profile,
} from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get(
    "/profile",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      isAuthenticated(req, res, next).then(() => {});
    },
    profile as (req: express.Request, res: express.Response) => void
  );
};
