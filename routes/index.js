var router = require("express").Router();
const knex = require("knex")(require("../database/knexfile").development);

// Middleware to check m2m text token auth
const checkM2MTokenAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== process.env.M2M_TOKEN_SECRET) {
    return res.status(403).json({ error: "Invalid token" });
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

// New endpoint to check if a user exists by email
router.post(
  "/api/check-user-by-email",
  checkM2MTokenAuth,
  async function (req, res) {
    const { email } = req.body;

    if (!email) {
      console.log(`[CHECK-USER-BY-EMAIL] Email is missing in the request.`);
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await knex("users").where({ email }).first();
      if (user) {
        console.log(
          `[CHECK-USER-BY-EMAIL] User found: ${JSON.stringify(user)}`
        );
        return res.json({ message: "User exists", user });
      } else {
        console.log(`[CHECK-USER-BY-EMAIL] User not found for email: ${email}`);
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error checking user by email:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// New endpoint to update user password (No hashing for testing)
router.post(
  "/api/update-password",
  checkM2MTokenAuth,
  async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    try {
      const user = await knex("users").where({ email }).first();
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await knex("users").where({ email }).update({ password });
      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// New endpoint to check if a user exists based on email and password
router.post(
  "/api/check-user-by-credentials",
  checkM2MTokenAuth,
  async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log(
        `[CHECK-USER-CREDENTIALS] Email and password are missing in the request.`
      );
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await knex("users").where({ email }).first();
      if (user && user.password === password) {
        console.log(
          `[CHECK-USER-CREDENTIALS] User found: ${JSON.stringify(user)}`
        );
        return res.json({ message: "User exists", user });
      } else {
        console.log(
          `[CHECK-USER-CREDENTIALS] Invalid credentials for email: ${email}`
        );
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error checking user credentials:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
