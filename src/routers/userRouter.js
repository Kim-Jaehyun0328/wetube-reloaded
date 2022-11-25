import express from "express";
import {see, logout, getEdit, postEdit, startGithubLogin, finishGithubLogin, getChanggePassword, postChanggePassword} from "../controllers/userController"
import { uploadAvatar, protectorMiddleware, publicOnlyMiddleware} from "../middlewares";
const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(uploadAvatar.single("avatar"), postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);
userRouter.route("/change-password").all(protectorMiddleware).get(getChanggePassword).post(postChanggePassword);


export default userRouter;