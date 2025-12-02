const bcrypt = require('bcryptjs');
const User = require('../models/user.model.js');
const sendTokenAsCookie = require('../utils/sendTokenAsCookie.js')

const signup = async (req, res) => {
    try {
        let { username, password, fullName, gender } = req.body;
        if(!username || !password || !fullName || !gender) return res.status(400).json({error: "All fields must be filled."});

        username = username.toLowerCase().trim();
        const usernameRegex = /^[a-z0-9._]+$/;
    
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: "Username contains invalid characters." });
        }
        
        if(password.length < 6) return res.status(400).json({error: "Password must be at least 6 charecters long."});
        if(username.length < 3 || username.length > 20) return res.status(400).json({error: "Username must be between 3 and 20 characters long."});

        const oldUser = await User.findOne({username});
        if(oldUser)return res.status(400).json({error: "User already exists."});
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const boyPic = 'https://avatar.iran.liara.run/public/boy?username=' + username;
        const girlPic = 'https://avatar.iran.liara.run/public/girl?username=' + username;

        const user = new User({
            username,
            password:hashedPassword,
            fullName,
            gender,
            profilePicture: gender !== 'female' ? boyPic : girlPic,
        });


        await user.save();

        sendTokenAsCookie(user._id, res);
        res.status(201).json({
            _id:user._id,
            fullName,
            username,
            gender,
            profilePicture:user.profilePicture
        });
    }catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({error: "Something went wrong!"});
    }
}

const login = async (req, res) => {
    try {
        let { username, password } = req.body;

        username = username.toLowerCase().trim();
        
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordCorrect) return res.status(402).json({error: "Invalid username or password"})

        sendTokenAsCookie(user._id, res);
        res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            username: user.username,
            gender: user.gender,
            profilePicture:user.profilePicture
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error: "Something went wrong."});
    }
}

const logout = async (req, res) => {
    try {
        res.cookie('token', '', {maxAge: 0}).status(200).json({message:"Succesfully logged out."});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({error: "Something went wrong."});
    }
}

module.exports = {signup, login, logout};

