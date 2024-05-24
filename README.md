config/passport.js:
Configure and set up Passport strategies for local and social authentication (Google, Facebook, Twitter, GitHub).

controllers/authController.js:
Handle user registration, login, logout, and social authentication.

controllers/userController.js:
Manage user profiles, including getting profile details, updating profile details, and listing public profiles. Admin-specific functionalities are also handled here.

models/User.js:
Define the User schema and model using Mongoose.

routes/auth.js:
Define routes for authentication (registration, login, logout, social login).

routes/user.js:
Define routes for user profile management (view, update profiles, list public profiles, admin functionalities).

middlewares/authMiddleware.js:
Middleware to protect routes and implement role-based access control.

utils/validate.js:
Define validation functions for user inputs.

.env:
Store environment variables.


app.js:
Initialize the Express application, set up middlewares, and import routes.

server.js:
Start the server and connect to the database.
