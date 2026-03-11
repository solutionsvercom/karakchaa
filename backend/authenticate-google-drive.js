const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const PROJECT_ROOT = __dirname;
const CREDENTIALS_PATH = path.join(PROJECT_ROOT, "google-oauth-credentials.json");
const TOKEN_PATH = path.join(PROJECT_ROOT, "google-drive-token.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function printSetupInstructions() {
  console.log("===================================================");
  console.log(" Google Drive OAuth2 Setup Instructions");
  console.log("===================================================");
  console.log("1. Go to: https://console.cloud.google.com/");
  console.log("2. Create a new project (or select an existing one).");
  console.log("3. In the left menu, go to 'APIs & Services' -> 'Library'.");
  console.log("4. Search for 'Google Drive API' and ENABLE it.");
  console.log("5. Go to 'APIs & Services' -> 'Credentials'.");
  console.log("6. Click 'Create Credentials' -> 'OAuth client ID'.");
  console.log("7. Choose 'Desktop app' as the Application type.");
  console.log("8. After creating, click 'Download JSON' for the client.");
  console.log("9. Rename the downloaded file to: google-oauth-credentials.json");
  console.log(
    "10. Move the file into your backend project root folder:\n    " + PROJECT_ROOT
  );
  console.log("11. Then run this command again:");
  console.log("    node authenticate-google-drive.js");
  console.log("===================================================");
}

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log(
      "[GOOGLE DRIVE] Credentials file 'google-oauth-credentials.json' not found in:"
    );
    console.log("  " + CREDENTIALS_PATH);
    printSetupInstructions();
    process.exitCode = 1;
    return null;
  }

  try {
    const content = fs.readFileSync(CREDENTIALS_PATH, "utf8");
    const parsed = JSON.parse(content);

    const installed = parsed.installed || parsed.web;
    if (!installed) {
      console.error(
        "[GOOGLE DRIVE] Invalid credentials file format. Expected 'installed' or 'web' key."
      );
      process.exitCode = 1;
      return null;
    }

    const { client_id, client_secret, redirect_uris } = installed;
    if (!client_id || !client_secret || !redirect_uris || !redirect_uris.length) {
      console.error(
        "[GOOGLE DRIVE] Missing client_id/client_secret/redirect_uris in credentials."
      );
      process.exitCode = 1;
      return null;
    }

    return {
      clientId: client_id,
      clientSecret: client_secret,
      redirectUri: redirect_uris[0],
    };
  } catch (err) {
    console.error("[GOOGLE DRIVE] Failed to read credentials file:", err);
    process.exitCode = 1;
    return null;
  }
}

function createOAuthClient() {
  const creds = loadCredentials();
  if (!creds) return null;

  return new google.auth.OAuth2(
    creds.clientId,
    creds.clientSecret,
    creds.redirectUri
  );
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("===================================================");
  console.log("[GOOGLE DRIVE] Authorization required.");
  console.log("1. Open this URL in your browser:");
  console.log("");
  console.log(authUrl);
  console.log("");
  console.log(
    "2. Sign in with the Google account where you want to store backups."
  );
  console.log("3. Click 'Allow' to grant access to Google Drive.");
  console.log(
    "4. You will see an authorization code. Copy it and paste it here."
  );
  console.log("===================================================");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the authorization code here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code.trim(), (err, token) => {
      if (err || !token) {
        console.error(
          "[GOOGLE DRIVE] Error retrieving access token:",
          err || "No token received"
        );
        process.exitCode = 1;
        return;
      }
      oAuth2Client.setCredentials(token);
      try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2), "utf8");
        console.log("===================================================");
        console.log("[GOOGLE DRIVE] Token stored successfully at:");
        console.log("  " + TOKEN_PATH);
        console.log(
          "[GOOGLE DRIVE] Scheduler can now upload Excel backups to Google Drive."
        );
        console.log("===================================================");
      } catch (writeErr) {
        console.error(
          "[GOOGLE DRIVE] Failed to save token file:",
          writeErr
        );
        process.exitCode = 1;
      }
    });
  });
}

function main() {
  console.log("===================================================");
  console.log("[GOOGLE DRIVE] Starting OAuth2 authentication helper...");
  console.log("Project root:", PROJECT_ROOT);
  console.log("===================================================");

  const oAuth2Client = createOAuthClient();
  if (!oAuth2Client) {
    return;
  }

  if (fs.existsSync(TOKEN_PATH)) {
    console.log("[GOOGLE DRIVE] Existing token file found at:");
    console.log("  " + TOKEN_PATH);
    console.log(
      "[GOOGLE DRIVE] If you want to re-authenticate, delete this file and run this script again."
    );
  }

  getNewToken(oAuth2Client);
}

main();

