var router = require("express").Router();
const knex = require('knex')(require('./knexfile').development);
// const dbUser = {
//   user_id: "456671",
//   nickname: "csamyphew2",
//   email: "amy.chow+123@masterconcept.ai",
// };

// Middleware to check basic auth
const checkBasicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).json({ error: "Authentication required" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  if (
    username !== process.env.API_USERNAME ||
    password !== process.env.API_PASSWORD
  ) {
    return res.status(403).json({ error: "Invalid credentials" });
  }

  next();
};

// Original endpoints
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Auth0 Webapp sample Nodejs",
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

router.get("/profile", function (req, res, next) {
  res.render("profile", {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: "Profile page",
  });
});

// Protected API endpoint that requires basic auth
router.post("/api/data", async function (req, res) {
  const { email } = req.body;

  console.log(`[API-DATA] Data request by ${req.headers.authorization}`);
  try {
    const user = await knex('users').where({ email }).first();
    if (user && !user.is_migrated) {
      return res.json(user);
    }
    return res.json({ error: "access denied" });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint to check if a user exists by email
router.post("/api/check-user-by-email", async function (req, res) {
  const { email } = req.body;

  if (!email) {
    console.log(`[CHECK-USER-BY-EMAIL] Email is missing in the request.`);
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await knex('users').where({ email }).first();
    if (user) {
      console.log(`[CHECK-USER-BY-EMAIL] User found: ${JSON.stringify(user)}`);
      return res.json({ message: "User exists", user });
    } else {
      console.log(`[CHECK-USER-BY-EMAIL] User not found for email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error checking user by email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint to update user password (No hashing for testing)
router.post("/api/update-password", async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await knex('users').where({ email }).update({ password });
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// New endpoint to check if a user exists based on client ID
router.post("/api/check-user", checkBasicAuth, async function (req, res) {
  const { clientId } = req.body;

  if (!clientId) {
    console.log(`[CHECK-USER] Client ID is missing in the request.`);
    return res.status(400).json({ error: "Client ID is required" });
  }

  try {
    const user = await knex('users').where({ user_id: clientId }).first();
    if (user) {
      console.log(`[CHECK-USER] User found: ${JSON.stringify(user)}`);
      await knex('users').where({ user_id: clientId }).update({ is_migrated: true });
      return res.json({ message: "User exists", user });
    } else {
      console.log(`[CHECK-USER] User not found for Client ID: ${clientId}`);
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error checking user by client ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;