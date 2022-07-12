import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
// Todo: add xtrace
// import { getSecret } from '../../helpers/todos'

import { secretsManager } from 'middy/middlewares'
import * as middy from 'middy'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-0x8gk6i7.us.auth0.com/.well-known/jwks.json'
let cert: string;

// const auth0Secret = process.env.AUTH_0_SECRET;

const secretId =  process.env.SECRET_NAME;
const secretKey =  process.env.AUTH_0_SECRET_CERT_KEY;

export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
  // console.log('event', event)
  // console.log('context', context)
  // logger.info('Authorizing a user', event.authorizationToken)
  let tmpCert = context.AUTH0_SECRET[secretKey];
  // console.log()
  cert = Buffer.from(tmpCert, 'base64').toString('utf-8')

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // const secretOjbect: any = await getSecret()
  // const secret = secretOjbect[secretValue];
  // console.log('secretOjbect', secretOjbect)
  // console.log('secret', secret)
  // logger.info(secret)

  // const secret = await getSecret(secretId);
  // logger.info(secret)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  // return verify(token, auth0Secret) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    // Throw an error if can't read the secret
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
)
