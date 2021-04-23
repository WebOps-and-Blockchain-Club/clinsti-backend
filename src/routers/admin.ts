import express from "express";

const router = express.Router();

router.post('/admin',async(req,res)=>{
  const {email, password} = req.body;
  if(!email||!password){
    return res.status(200).json(false);
  }
  if(email === "abc@xyz.com" && password ==="test1234"){
    const token = "NewMyToken4"
    return res.status(200).cookie("token",token,{httpOnly:true,maxAge:1000*60*60*24*3}).json(true);
  }else{
    return res.status(200).json(false);
  }
});

router.delete('/admin',async(_,res)=>{
  res.cookie("token","",{httpOnly:true,maxAge:1}).json(false)
});

router.get('/admin',async(req,res)=>{
  const token = req.cookies.token;
  if(!token){
    return res.status(200).json(false)
  }
  if(token === "NewMyToken4"){
    return res.status(200).json(true);
  }else{
    return res.status(200).json(false);
  }
});

export default router
