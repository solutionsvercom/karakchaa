require("dotenv").config({ path: "../../.env" });

const mongoose = require("mongoose");
const User = require("../models/Users/UserSchema");
const Role = require("../models/Users/RoleSchema");

const updateRoleNames = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find();

        for (const user of users) {
            if (!user.role) continue;

            const roleDoc = await Role.findById(user.role);

            if (roleDoc) {
                user.roleName = roleDoc.name;
                await user.save();
                // ✅ CHANGED: log companyId instead of email
                console.log(`Updated ${user.companyId} → ${roleDoc.name}`);
            }
        }

        console.log("✅ All users updated");
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateRoleNames();