require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');
const User = require('../models/Users/UserSchema');
const Role = require('../models/Users/RoleSchema');

const createUsers = async() => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to DB:", mongoose.connection.name);

        // Get roles from DB
        const adminRole = await Role.findOne({ name: "admin" });
        const managerRole = await Role.findOne({ name: "manager" });
        const staffRole = await Role.findOne({ name: "staff" });

        if (!adminRole || !managerRole || !staffRole) {
            console.log("❌ Roles not found. Create roles first.");
            process.exit();
        }

        for (const userData of users) {

            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {

                existingUser.password = userData.password;
                existingUser.role = userData.role;
                existingUser.isActive = true;

                await existingUser.save();

                console.log(`${userData.email} updated`);

            } else {

                const newUser = new User({
                    ...userData,
                    isActive: true
                });

                await newUser.save();

                console.log(`${userData.email} created`);

            }

        }

        console.log("✅ All users processed");

        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

};

createUsers();