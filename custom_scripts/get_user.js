function getByEmail(email, callback) {
    const request = require("request");
  
    // Your server's API endpoint
    const serverUrl = "https://a6f7-202-64-44-162.ngrok-free.app/api/check-user-by-email";
  
    console.log(`[getuser] Checking for user with email: ${email}`);
  
    // Perform a POST request to the server to search for the user
    request.post(
      {
        url: serverUrl,
        json: {
          email: email, // Pass the email in the body
        },
      },
      (error, response, body) => {
        if (error) {
          console.error(`[getuser] Error reaching the server: ${error.message}`);
          return callback(new Error("Failed to reach the server."));
        }
  
        if (response.statusCode === 404) {
          console.log(`[getuser] User not found for email: ${email}`);
          return callback(null); // User not found
        }
  
        if (response.statusCode !== 200) {
          console.error(`[getuser] Unexpected status code: ${response.statusCode}`);
          return callback(new Error("Unexpected server response."));
        }
  
        try {
          const user = body.user;
  
          if (!user) {
            console.log(`[getuser] No user found in server response for email: ${email}`);
            return callback(null); // User not found
          }
  
          // Construct the user profile
          const profile = {
            user_id: user.user_id,
            email: user.email,
          };
  
          console.log(`[getuser] User found: ${JSON.stringify(profile)}`);
          return callback(null, profile); // User found
        } catch (parseError) {
          console.error(`[getuser] Failed to parse server response: ${parseError.message}`);
          return callback(new Error("Failed to parse server response."));
        }
      }
    );
  }