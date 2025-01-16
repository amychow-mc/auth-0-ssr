function login(email, password, callback) {
    const request = require("request");
    console.log(`login script for email: ${email}`);
  
    // Original functionality
    request.post(
      {
        url: "https://a6f7-202-64-44-162.ngrok-free.app/api/data",
        auth: {
          username: email,
          password: password,
        },
        json: {
          email: email,
        },
      },
      function (err, response, body) {
        console.log("success post");
        if (err) {
          console.log(`[LOGIN] Error during /api/data request: ${err.message}`);
          return callback(err);
        }
  
        if (response.statusCode === 401 || response.statusCode === 403) {
          console.log(`[LOGIN] Authentication failed at /api/data.`);
          return callback();
        }
  
        if (response.statusCode === 200) {
          console.log("result 200", body);
          const result = body;
          console.log(`[LOGIN] User authenticated: ${JSON.stringify(result)}`);
  
          if (result.user_id) {
            // New functionality to check user by client ID
            request.post(
              {
                url: "https://a6f7-202-64-44-162.ngrok-free.app/api/check-user",
                auth: {
                  username: email,
                  password: password,
                },
                json: {
                  clientId: result.user_id, // Replace with the client ID you want to check
                },
              },
              function (err, response, body) {
                if (err) {
                  console.log(
                    `[CHECK-USER] Error during /api/check-user request: ${err.message}`
                  );
                  return;
                }
  
                if (response.statusCode === 404) {
                  console.log(
                    `[CHECK-USER] User not found in server-side database for /api/check-user.`
                  );
                  return;
                }
  
                if (response.statusCode === 200) {
                  const user = body.user;
                  console.log(
                    `[CHECK-USER] User found in server-side database: ${JSON.stringify(
                      user
                    )}`
                  );
                }
              }
            );
          }
  
          // Add user to Auth0 "Username-Password-Authentication" database
          const managementApiToken = configuration.apiToken; // Replace with a valid token
          const auth0Domain = "coffee-elephant-70414.cic-demo-platform.auth0app.com"; // Replace with your Auth0 domain
  
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
  
            console.log(
              `[AUTH0 CREATE USER] User successfully created in Auth0: ${JSON.stringify(
                body
              )}`
            );
          });
  
          return callback(null, {
            user_id: result.user_id.toString(),
            nickname: result.nickname,
            email: result.email,
          });
        }
  
        return callback(err);
      }
    );
  }