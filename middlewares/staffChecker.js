const staffChecker = (req,res,next)=>{
    if(["admin","employee","leader"].includes(req.user.role)){
        next()
    }else{
        return res.status(401).json({msg:"Unauthorized"})
    }
}

module.exports = staffChecker;