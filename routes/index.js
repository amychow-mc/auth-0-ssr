var router = require("express").Router();
const dbUser = {
  user_id: "456671",
  nickname: "csamyphew2",
  email: "amy.chow+123@masterconcept.ai",
};


// New endpoint to check if a user exists by email
router.post("/api/check-user-by-email", function (req, res) {
  const { email } = req.body; // Expecting email in the request body

  if (!email) {
    console.log(`[CHECK-USER-BY-EMAIL] Email is missing in the request.`);
    return res.status(400).json({ error: "Email is required" });
  }

  // Simulated custom database lookup
  const userDatabase = [dbUser];

  const user = userDatabase.find((u) => u.email === email);

  if (user) {
    console.log(`[CHECK-USER-BY-EMAIL] User found: ${JSON.stringify(user)}`);
    return res.json({ message: "User exists", user });
  } else {
    console.log(`[CHECK-USER-BY-EMAIL] User not found for email: ${email}`);
    return res.status(404).json({ error: "User not found" });
  }
});


// New endpoint to update user password (No hashing for testing)
router.post("/api/update-password", function (req, res) {
  const { email, password } = req.body;

  // Validate that email and password are provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Find the user in the database by email
    const userDatabase = [dbUser];
    const user = userDatabase.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the password (no hashing for testing)
    user.password = password; // Store the new password

    // Return a success response
    return res.json({ success: true, message: 'Password updated successfully', user });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

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

// New endpoint to check if a user exists based on client ID
router.post("/api/check-user", checkBasicAuth, function (req, res) {
  const { clientId } = req.body; // Expecting client ID in the request body

  if (!clientId) {
    console.log(`[CHECK-USER] Client ID is missing in the request.`);
    return res.status(400).json({ error: "Client ID is required" });
  }

  // Simulated custom database lookup
  const userDatabase = [dbUser];
  console.log(userDatabase, process.env.API_USERNAME);

  const user = userDatabase.find((u) => u.user_id === clientId);

  if (user) {
    console.log(`[CHECK-USER] User found: ${JSON.stringify(user)}`);
    // write is_migrate into database
    user.isMigrated = true;
    // after success write return true, if error return false
    return res.json({ message: "User exists", user });
  } else {
    console.log(`[CHECK-USER] User not found for Client ID: ${clientId}`);
    return res.status(404).json({ error: "User not found" });
  }
});

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
router.post("/api/data", function (req, res) {
  const { email } = req.body; // Expecting client ID in the request body

  console.log(`[API-DATA] Data request by ${req.headers.authorization}`);
  const userDatabase = [dbUser];
  const user = userDatabase.find((u) => u.email === email);
  console.log(user);
  if (user && !user.isMigrated) {
    return res.json(dbUser);
  }
  return res.json({ error: "access denied" });
});

module.exports = router;