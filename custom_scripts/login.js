// For during gradual migration
function login(email, password, callback) {
  const request = require("request");
  console.log(`login script for email: ${email}`);

  const m2m_token = "12345678";
  const serverUrl =
    "https://c161-202-64-44-178.ngrok-free.app/api/check-user-by-credentials";

  request.post(
    {
      url: serverUrl,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${m2m_token}`,
      },
      json: {
        email,
        password,
      },
    },
    function (err, response, body) {
      if (err) {
        console.log(
          `[LOGIN] Error during /api/check-user-by-credentials request: ${err.message}`
        );
        return callback(err);
      }

      if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(
          `[LOGIN] Authentication failed at /api/check-user-by-credentials.`
        );
        return callback();
      }

      if (response.statusCode === 200) {
        const result = body;

        // Add user to Auth0 "Username-Password-Authentication" database
        const managementApiToken = configuration.apiToken; // Replace with a valid token
        const auth0Domain =
          "coffee-elephant-70414.cic-demo-platform.auth0app.com"; // Replace with your Auth0 domain

        const options = {
          url: `https://${auth0Domain}/api/v2/users`,
          headers: {
            Authorization: `Bearer ${managementApiToken}`,
          },
          json: {
            email: email,
            password: password,
            connection: "Username-Password-Authentication",
          },
        };

        request.post(options, function (err, response, body) {
          if (err) {
            console.log(`[AUTH0 CREATE USER] Error: ${err.message}`);
            return callback(err);
          }

          if (response.statusCode !== 201) {
            console.log(
              `[AUTH0 CREATE USER] Failed: ${response.statusCode} - ${body.message}`
            );
            return callback(new Error(body.message));
          }

          console.log(`[AUTH0 CREATE USER] User successfully created in Auth0`);
        });

        return callback(null, {
          user_id: result.user.id.toString(),
          nickname: result.user.name,
          email: result.user.email,
        });
      }

      return callback(err);
    }
  );
}
