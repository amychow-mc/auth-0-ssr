function changePassword(email, newPassword, callback) {
    const request = require("request");
  
    const checkUserUrl = "https://a6f7-202-64-44-162.ngrok-free.app/api/check-user-by-email"; // API to check user
    const auth0Domain = "coffee-elephant-70414.cic-demo-platform.auth0app.com"; // Auth0 domain
    const managementApiToken = configuration.apiToken; // Replace with a valid Auth0 management API token
  
    console.log(`[changePassword] Checking user existence for email: ${email}`);
  
    // Step 1: Check if the user exists in the server-side database
    request.post(
      {
        url: checkUserUrl,
        json: { email: email },
      },
      (checkError, checkResponse, checkBody) => {
        if (checkError) {
          console.error(`[changePassword] Error checking user: ${checkError.message}`);
          return callback(new Error("Error checking user existence."));
        }
  
        if (checkResponse.statusCode === 404) {
          console.log(`[changePassword] User not found. Creating a new user in Auth0.`);
          // createUserInAuth0(email, newPassword);
          createUserInAuth0customdb(email, newPassword);
          return callback(null, true);
        } else if (checkResponse.statusCode === 200) {
          console.log(`[changePassword] User found. Checking migration status.`);
          const user = checkBody.user;
  
          if (!user.isMigrated) {
            console.log(`[changePassword] User is not migrated. Creating the user in Auth0.`);
            // createUserInAuth0(email, newPassword);
            createUserInAuth0customdb(email, newPassword);
            return callback(null, true);
  
          } else {
            console.log(`[changePassword] User is migrated. Sending password reset email.`);
            sendPasswordResetEmail(email);
            return callback(null, true);    
          }
        } else {
          console.error(`[changePassword] Unexpected response: ${checkResponse.statusCode}`);
          return callback(new Error("Unexpected response while checking user existence."));
        }
      }
    );
  
    // Function to create a user in Auth0 (native db)
    function createUserInAuth0(email, password) {
      const createUserOptions = {
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
  
      request.post(createUserOptions, (createError, createResponse, createBody) => {
        if (createError) {
          console.error(`[AUTH0 CREATE USER MAIN] Error: ${createError.message}`);
          // return callback(new Error("Error creating user in Auth0."));
        }
  
        if (createResponse.statusCode !== 201) {
          console.error(`[AUTH0 CREATE USER MAIN] Failed: ${createResponse.statusCode} - ${createBody.message}`);
          // return callback(new Error("Failed to create user in Auth0."));
        }
  
        console.log(`[AUTH0 CREATE USER MAIN] User successfully created in Auth0: ${JSON.stringify(createBody)}`);
        // callback(null, true); // User creation successful
      });
    }
  
  
    // Check if the user exists in the server-side database (custom db)
    // request.post(
    //   {
    //     url: checkUserUrl,
    //     json: { email: email },
    //   },
    //   (checkError, checkResponse, checkBody) => {
    //     if (checkError) {
    //       console.error(`[changePassword] Error checking user: ${checkError.message}`);
    //       return callback(new Error("Error checking user existence."));
    //     }
  
    //     if (checkResponse.statusCode === 404) {
    //       console.log(`[changePassword] User not found. Creating a new user in Auth0.`);
    //       createUserInAuth0customdb(email, newPassword, callback);
    //     } else if (checkResponse.statusCode === 200) {
    //       console.log(`[changePassword] User found. Checking migration status.`);
    //       const user = checkBody.user;
  
    //       if (!user.isMigrated) {
    //         console.log(`[changePassword] User is not migrated. Creating the user in Auth0.`);
    //         createUserInAuth0customdb(email, newPassword, callback);
    //       } else {
    //         console.log(`[changePassword] User is migrated. Sending password reset email.`);
    //         sendPasswordResetEmail(email, callback);
    //       }
    //     } else {
    //       console.error(`[changePassword] Unexpected response: ${checkResponse.statusCode}`);
    //       return callback(new Error("Unexpected response while checking user existence."));
    //     }
    //   }
    // );
  
  
    // Function to create a user in Auth0 (custom db)
    function createUserInAuth0customdb(email, password) {
      const createUserOptions = {
        url: `https://${auth0Domain}/api/v2/users`,
        headers: {
          Authorization: `Bearer ${managementApiToken}`,
        },
        json: {
          email: email,
          password: password,
          connection: "demo-db",
        },
      };
  
      request.post(createUserOptions, (createError, createResponse, createBody) => {
        if (createError) {
          console.error(`[AUTH0 CREATE USER CUSTOM] Error: ${createError.message}`);
          // return callback(new Error("Error creating user in Auth0."));
        }
  
        if (createResponse.statusCode !== 201) {
          console.error(`[AUTH0 CREATE USER CUSTOM] Failed: ${createResponse.statusCode} - ${createBody.message}`);
          // return callback(new Error("Failed to create user in Auth0."));
        }
  
        console.log(`[AUTH0 CREATE USER CUSTOM] User successfully created in Auth0: ${JSON.stringify(createBody)}`);
        // callback(null, true); // User creation successful
      });
    }
  
  
    // Function to send a password reset email through Auth0
    function sendPasswordResetEmail(email) {
      const sendResetEmailOptions = {
        url: `https://${auth0Domain}/dbconnections/change_password`,
        json: {
          client_id: "KSdeyyrzTfmrpJ9dka7HEBW8apOeo97l", // Replace with your Auth0 Client ID
          email: email,
          connection: "demo-db",
        },
      };
  
      request.post(sendResetEmailOptions, (resetError, resetResponse, resetBody) => {
        if (resetError) {
          console.error(`[AUTH0 PASSWORD RESET EMAIL] Error: ${resetError.message}`);
          // return callback(new Error("Error sending password reset email."));
        }
  
        else if (resetResponse.statusCode !== 200) {
          console.error(`[AUTH0 PASSWORD RESET EMAIL] Failed: ${resetResponse.statusCode} - ${resetBody.message}`);
          // return callback(new Error("Failed to send password reset email."));
        }
        
        else{
          console.log(`[AUTH0 PASSWORD RESET EMAIL] Password reset email sent successfully.`);
          // return callback(null, true); // Password reset email sent successfully
        }
      });
    }
  }