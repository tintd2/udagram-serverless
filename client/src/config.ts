// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// const apiId = 'z6dah0im92'
// export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev2`
export const apiEndpoint = `http://localhost:3000/dev2`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-0x8gk6i7.us.auth0.com',            // Auth0 domain
  clientId: 'lmId3iXY8UGju1359adcj3HCRIi20XAI',          // Auth0 client id
  callbackUrl: 'http://localhost:3001/callback'
  // callbackUrl: 'http://localhost:3000/callback'
}
