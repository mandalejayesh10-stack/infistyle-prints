const { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand 
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: "ap-south-1" });
const UserPoolId = "ap-south-1_DlxCsvHSt";
const ClientId = "33ngfo1e2buqj39p5lnebusjbi";
const email = "admin@infistyle.com";
const password = "AdminPassword@123";

async function run() {
  try {
    const data = await client.send(new InitiateAuthCommand({
      ClientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    }));
    
    const idToken = data.AuthenticationResult.IdToken;
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString();
    const claims = JSON.parse(jsonPayload);
    
    console.log("TOKEN_CLAIMS:", JSON.stringify(claims, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();
