import express from "express";
import {see, logout, edit, startGithubLogin, finishGithubLogin} from "../controllers/userController"

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/:id(\\d+)", see);


export default userRouter;