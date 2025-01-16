function changePassword(email, newPassword, callback) {
  const request = require("request");

  const auth0Domain = "coffee-elephant-70414.cic-demo-platform.auth0app.com"; // Auth0 domain
  const managementApiToken = configuration.apiToken; // Replace with a valid Auth0 management API token

  console.log(`[changePassword] Checking user existence for email: ${email}`);
  console.log(`new password: ${newPassword}`);

  const getUserOptions = {
    url: `https://${auth0Domain}/api/v2/users-by-email`,
    headers: {
      Authorization: `Bearer ${managementApiToken}`,
    },
    qs: {
      email: email,
    },
    json: true,
  };

  request.get(
    getUserOptions,
    function (getUserError, getUserResponse, getUserBody) {
      if (getUserError) {
        console.error(
          `[changePassword] Error fetching user: ${getUserError.message}`
        );
        return callback(new Error("Error fetching user."));
      }

      if (getUserBody.statusCode || getUserBody.length === 0) {
        console.error(`[changePassword] No user found with email: ${email}`);
        return callback(new Error("User not found."));
      }

      const user = getUserBody.find((user) =>
        user.identities.some(
          (identity) =>
            identity.connection === "Username-Password-Authentication"
        )
      );

      if (!user) {
        console.error(
          `[changePassword] No user found with connection: Username-Password-Authentication`
        );
        return callback(new Error("User not found with specified connection."));
      }

      const userId = user.user_id;

      console.log(`[changePassword] User found with ID: ${userId}`);

      // Proceed with password change
      const options = {
        url: `https://${auth0Domain}/api/v2/users/${userId}`,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${managementApiToken}`,
        },
        json: {
          password: newPassword,
          connection: "Username-Password-Authentication",
        },
      };

      request.patch(options, function (err, response, body) {
        if (err) {
          console.log(`[AUTH0 MAIN UPDATE PASSWORD] Error: ${err.message}`);
          return callback(err);
        }
        console.log(
          `[AUTH0 MAIN UPDATE PASSWORD] Response: ${JSON.stringify(body)}`
        );
        return callback(null, true);
      });
    }
  );
}
