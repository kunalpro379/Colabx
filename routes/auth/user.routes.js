import { Router } from 'express';
import User from '../../models/user.model.js'; // Ensure this path is correct and import User

const router = Router();

// Define routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);

router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);

// Route to get username by userId
router.get('/username/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('username'); // Fetch user by ID and select only the username field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ username: user.username });
    } catch (error) {
        console.error('Error fetching username:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 
