const validation = (req,res,next)=>{
    const c = req.body.city
    const matching = c.match(new RegExp([ab-AB]))
    if (c==matching){
        next()
    }
    else {
        res.send({msg: "Enter a Valid City name"})
    }
}

module.exports = {
    validation
}