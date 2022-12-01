import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

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
  return res.redirect("/");
};

export const getLogin = (req, res) => {
  return res.render("login", {pageTitle: "Login"});
};

export const postLogin = async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username, socialOnly: false});
  if(!user){
    return res.status(400).render("login", {pageTitle: "Login", errorMessage: "An account with this username does not exists."});
  }
  const ok = await bcrypt.compare(password, user.password);
  if(!ok)
    return res.render("login", {pageTitle: "Login", errorMessage: "Wrong password"});

  req.session.loggedIn = true;
  req.session.user = user;
  
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email"
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code : req.query.code,
  }
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
    },
  })
  ).json();
  if("access_token" in tokenRequest){
    const {access_token} = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await(
      await fetch(`${apiUrl}/user`,{
        headers: {
          Authorization: `token ${access_token}`,
      },
    })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find((email) => email.primary == true && email.verified == true);

    if(!emailObj){
      return res.redirect("/login");
    }
    let user = await User.findOne({email: emailObj.email});
    if(!user){
        user = await User.create({
          avatarUrl: userData.avatar_url,
          name: userData.name,
          username: userData.login,
          email: emailObj.email,
          password: "",
          socialOnly: true,
          location: userData.location,
        });
    }
    req.session.loggedIn= true;
    req.session.user = user;
    console.log(user.avatarUrl);
    return res.redirect("/");
  }else{
    return res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", {pageTitle: "Edit Profile"});
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, sessionemail, sessionusername, location },
    file,
  } = req;
  const exists = await User.exists({$or: [{sessionemail}, {sessionusername}]});
  const user = await User.findById(_id);


  if(exists && user.email != sessionemail && user.username != sessionusername)
    return res.status(400).render("edit-profile", {pageTitle: "Edit Profile", errorMessage: "This email/username is already taken."});
  const updatedUser = await User.findByIdAndUpdate(_id, {
    avatarUrl: file ? file.path : avatarUrl,
    name: name,
    email: sessionemail, 
    username: sessionusername, 
    location: location
  }, {new: true});
  req.session.user = updatedUser;
  return res.redirect("/");
};

export const logout = (req, res) => {
  req.flash("info", "Bye");
  req.session.user = null;
  req.session.loggedIn = false;
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if(req.session.user.socialOnly == true){
    req.flash("error", "Can not change password");
    return res.redirect("/");
  }
  return res.render("change-password", {pageTitle: "Change Password"});
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if(!ok){
    return res.status(400).render("change-password", {pageTitle: "Change Password", errorMessage: "The current password is incorect."});
  }
  if(newPassword != newPasswordConfirmation){
    return res.status(400).render("change-password", {pageTitle: "Change Password", errorMessage: "The password does not match."});
  }
  
  
  user.password = newPassword;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const {id} = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if(!user){
    return res.status(400).render("404", {pageTitle: "User not found"});
  }
  return res.render("profile", {pageTitle: `${user.name}'s Profile`, user});
};