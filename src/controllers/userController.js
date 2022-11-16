import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  return res.render("join", {pageTitle: "Join"});
};

export const postJoin = async (req, res) => {
  const {email, username, password, password2, name, location} = req.body;
  const exists = await User.exists({$or: [{email}, {username}]});

  if(exists)
    return res.status(400).render("join", {pageTitle: "Join", errorMessage: "This email/username is already taken."});
  if(password != password2)
    return res.status(400).render("join", {pageTitle: "Join", errorMessage: "Password confirmation does not match."});

  try{
    await User.create({
      email, username, password, name, location,
    });
  }catch(error){
    return res.status(404).render("/join", {pageTitle: "Join", errorMessage: error._message});
  }
  return res.redirect("/login");
};

export const getLogin = (req, res) => {
  return res.render("login", {pageTitle: "Login"});
};

export const postLogin = async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});
  if(!user){
    return res.status(400).render("login", {pageTitle: "Login", errorMessage: "An account with this username does not exists."});
  }
  const ok = await bcrypt.compare(password, user.password);
  if(!ok)
    return res.render("login", {pageTitle: "Login", errorMessage: "Wrong password"});
  res.end();
};

export const edit = (req, res) => res.send("Edit");
export const deleteUser = (req, res) => res.send("Delete");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See");