const UserModel = require("../model/userModel")

const updatePrivateAccount = async (req, res)=>{
    try {
        const user = await UserModel.findById(req.user._id);
        if(!user){
            return res.json({
                success: false,
                message: "User not found"
            })
        }
        if(user.privateAccount == true){
            await UserModel.findByIdAndUpdate(req.user._id, {privateAccount: false})
           return res.json({
                success: true,
                message: "Public account Now"
            })
        }else{
            await UserModel.findByIdAndUpdate(req.user._id, {privateAccount: true});
            return res.json({
                success: true,
                message: "Private account Now"
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Something went wrong"
        })
    }
}


// profile updation (fullName, profileDescription, profilePhoto, phoneNumber)
const updateProfile = async (req, res)=>{

   try {
    const user = await UserModel.findById(req.user._id);
    if(!user){
        return res.json({
            success: false,
            message: "User not found"
        });

    }

    if(!req.body.fullName && !req.body.profileDescription && !req.body.profilePhoto && !req.body.phoneNumber){
        return res.json({
            success:false,
            message: "Not allowed to edit other fields"
        })
    }
    const updateFields = {};
    if(req.body.fullName){
        updateFields.fullName = req.body.fullName;
    }
    if (req.body.profileDescription) {
        updateFields.profileDescription = req.body.profileDescription;
    }
    if (req.body.profilePhoto) {
        updateFields.profilePhoto = req.body.profilePhoto;
    }
    if (req.body.phoneNumber) {
        updateFields.phoneNumber = req.body.phoneNumber;
    }

    await UserModel.findByIdAndUpdate(req.user._id, updateFields);
    res.json({
        success: true,
        message: "Profile updated successfully"
    })
   } catch (error) {
    console.log(error);
    res.json({
        success: false,
        message: "Something went wrong"
    })
   }

}

module.exports= {
    updatePrivateAccount,
    updateProfile
}