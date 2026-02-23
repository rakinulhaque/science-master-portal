import 'dotenv/config.js';
import User from '../models/user.js';
import { hashPassword } from '../utils/password.js';
import sequelize from '../models/db.js';

const seedSuperAdmin = async () => {
    try {
        // Authenticate and sync (ensure tables exist)
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // We don't want to force sync here to avoid data loss, 
        // but we need to make sure the User model is ready.
        // sequelize.sync() is called in server.js, but for a standalone script,
        // it's safer to ensure tables exist if they don't.
        await User.sync();

        const mobile = "01816635169";
        const password = "tonmoybhai";
        const fullName = "Super Admin";

        const hashedPassword = await hashPassword(password);

        // 1. Find the user with requested mobile
        let user = await User.findOne({ where: { mobile } });

        // 2. Demote any OTHER super admins to 'admin' (to maintain one super admin rule)
        await User.update({ role: 'admin' }, {
            where: {
                role: 'super_admin',
                mobile: { [sequelize.Sequelize.Op.ne]: mobile }
            }
        });

        if (user) {
            console.log(`ℹ️ User with mobile ${mobile} already exists. Updating to super admin and setting password...`);
            user.password = hashedPassword;
            user.role = 'super_admin';
            user.fullName = fullName;
            await user.save();
        } else {
            console.log(`ℹ️ Creating new super admin with mobile ${mobile}...`);
            await User.create({
                fullName,
                mobile,
                password: hashedPassword,
                role: 'super_admin'
            });
        }

        console.log('✅ Super admin setup successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding super admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
