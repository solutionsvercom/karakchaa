require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');
const User = require('../models/Users/UserSchema');

const createUsers = async() => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to DB:", mongoose.connection.name);

        const users = [

            {
                name: "Admin User",
                email: "admin@karakchaa.com",
                password: "admin@123",
                role: "admin"
            },

            {
                name: "Manager User",
                email: "manager@karakchaa.com",
                password: "manager123",
                role: "manager"
            },

            {
                name: "Employee User",
                email: "employee@karakchaa.com",
                password: "employee123",
                role: "staff"
            }

        ];

        for (const userData of users) {

            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {

                existingUser.password = userData.password;
                existingUser.role = userData.role;
                existingUser.isActive = true;

                await existingUser.save();

                console.log(`${userData.role} password updated`);

            } else {

                const newUser = new User({
                    ...userData,
                    isActive: true
                });

                await newUser.save();

                console.log(`${userData.role} created`);

            }

        }

        console.log("All users processed");

        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

};

createUsers();