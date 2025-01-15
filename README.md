# Express OpenID Connect Webapp Sample

This sample demonstrates authentication for an Express Node.js app. The sample quickly shows how to log in, log out, and view profile information of the logged-in user.

See a detailed walk-through of this sample app on the [Express Quickstart](https://auth0.com/docs/quickstart/webapp/express).

## Running This Sample Locally

1. Install the dependencies with npm:

```bash
npm install
```


2. Rename `.env.example` to `.env` and replace or check the following values. 

> ⚠️ Note: If you downloaded this sample app directly from Auth0 Manage Dashboard, or from Auth0 Docs _and_ you chose the Auth0 application you're creating this sample for, then you can check these are configured already: 

- `CLIENT_ID` - your Auth0 application client id
- `ISSUER_BASE_URL` - absolute URL to your Auth0 application domain (ie: `https://accountName.auth0.com`)
- `SECRET` - a randomly rengerated string. You can generate one on the command line with the following `openssl rand -hex 32`

```bash
mv .env.example .env
```

3. Run the sample app:

```bash
npm start
npm dev #with hot reload
```

The sample app will be served at `localhost:3000`.

4. Start docker 
start docker to connect to local SQL database

``` bash
docker-compose up
```

5. Rum migration
For the first time, run the following to create user table
``` bash
npx knex migrate:latest
```
