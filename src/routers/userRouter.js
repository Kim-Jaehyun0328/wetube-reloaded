import express from "express";
import {see, logout, edit, deleteUser} from "../controllers/userController"

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", deleteUser);
userRouter.get("/:id(\\d+)", see);


export default userRouter;