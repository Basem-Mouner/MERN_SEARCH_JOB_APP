import { Router } from "express";
const router = Router();

import * as authServices from"./service/registration.service.js";
import * as loginServices from "./service/login.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middleWare/validation.middleware.js";
import passport from"passport";
const FRONTEND_LINK="http://localhost:5173";
// const FrE ="http://127.0.0.1:5501"
const FREGIT="https://basem-mouner.github.io/Fr_searchJob_App"

 //__________authServices layer routs SignUp_________
router.post("/signup", validation(validators.signup), authServices.signup);  
router.patch("/confirmEmail", validation(validators.confirmEmail), authServices.confirmEmail);  
router.patch("/resendOtp", validation(validators.resendOtp), authServices.resendOtp);   

//__________loginServices layer routs Login__________
router.post("/login", validation(validators.login), loginServices.login); 
router.post("/enable_2step",
  validation(validators.enable_2step),
  loginServices.enable_2step
);  
router.post("/confirm-login",
  validation(validators.confirm_login),
  loginServices.confirm_login
); 
//====================================================================
//_____LOGIN WITH GOOGLE SOCIAL LOGIN_________________
// Google login route hire when FE click sign wih google
router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback route ...>server google response to  FE BY ID TOKEN
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // at fail FE go to this
    // successRedirect: "/dashboard",
  }),
  // loginServices.loginWithGmail //callback function to backend directly
  (req, res) => {
    //must send idToken here to FrontEnd  and Backend take this id in body in other end point and verify from it and generate user
    const idToken = req.user.idToken;
    // Redirect to the frontend's dashboard route with the token as a query parameter
    console.log({idToken});
    

    // res.redirect(`${FRONTEND_LINK}/dashboard?idToken=${idToken}`);//by React
    
    res.redirect(`${FREGIT}/dashboard.html?idToken=${idToken}`);
  }
  
);
// RECEIVE idTOKEN FROM FE AND VERIFY FROM IT FROM GOOGLE BE AND COMPLETE ASSIGN IN DB
router.post("/loginWithGmail", loginServices.loginWithGmail);
//_____________________________END LOGIN WITH GOOGLE________________________________________________
//================================================================================================ 
router.patch("/forgetPassword", validation(validators.forgetPassword), loginServices.forgetPassword); 
router.patch("/resetPassword", validation(validators.resetPassword), loginServices.resetPassword);
router.get("/refreshToken", loginServices.refreshToken);     
//===========================================
//==========================================
//________________________________
export default router
