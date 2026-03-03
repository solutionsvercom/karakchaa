require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');
const User = require('../models/Users/UserSchema');
const Role = require('../models/Users/RoleSchema');



const createUsers = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB:", mongoose.connection.name);

        const adminRole = await Role.findOne({ name: "admin" });
        const managerRole = await Role.findOne({ name: "manager" });
        const staffRole = await Role.findOne({ name: "staff" });

        if (!adminRole || !managerRole || !staffRole) {
            console.log("❌ Roles not found. Create roles first.");
            process.exit();
        }

        const roleMap = { admin: adminRole, manager: managerRole, staff: staffRole };

        for (const userData of users) {
            const roleDoc = roleMap[userData.roleKey];

            const existingUser = await User.findOne({ companyId: userData.companyId });

            if (existingUser) {
                existingUser.password = userData.password;
                existingUser.role = roleDoc._id;
                existingUser.roleName = roleDoc.name;
                existingUser.email = userData.email || null;
                existingUser.isActive = true;
                await existingUser.save();
                console.log(`✅ Updated: ${userData.companyId}`);
            } else {
                const newUser = new User({
                    name: userData.name,
                    companyId: userData.companyId,
                    email: userData.email || null,
                    password: userData.password,
                    role: roleDoc._id,
                    roleName: roleDoc.name,
                    isActive: true
                });
                await newUser.save();
                console.log(`✅ Created: ${userData.companyId}`);
            }
        }

        console.log("✅ All users processed");
        process.exit();

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createUsers();