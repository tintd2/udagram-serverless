import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-0x8gk6i7.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJEn07nEvS9SyCMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0weDhnazZpNy51cy5hdXRoMC5jb20wHhcNMjIwNjEyMDU0NjA3WhcN
MzYwMjE5MDU0NjA3WjAkMSIwIAYDVQQDExlkZXYtMHg4Z2s2aTcudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvigz0/hHzBzCqf2F
ap8r2AilY98ZIpksvvkpkkGMYMc0/egYegXE5CkmLZWylUV7QrCzK5v86LJXawf3
NfdC9D94Q0J2sPi82CBMNpl+jALg7rJHuXPDUNEzvC0Ci2DtVLBZIkNOMXM6Pw+w
BHc1oyLdBaWHpehP5ehpKs+gJkpwDQmPCHK9J8EMMRQo6aVlXjsgcvvdWj0hhYEt
Exi2PlFZzAJ2mj5WiVr3DwLjTKmsGxNAwAA02xglHG+g9bvVFolgFVS9p6rkF2v7
UdudzNJ3AoW/WWuTcc8Mf8E9qYw/AysdWoBvnT0RIcigZnA3bIyOukrL+4HNbQc+
Wu55vQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT8NbK8llN7
W1iyw0ttkQOOT9D6RDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGpXzOz/42xoIjfCugw18WKupcb2qsOVnOIxdpYu2W+M2T8wlpx6DHzCneuO7bLN
yA7z86+ZUAUEQnFMLIkhUPb8YC9gDKeXoEQafVnbgr1tOxcKVwDKJXwDoBYIY8Zj
jUckBZBG0GDeGmiCHZlJaDEXNFE2C4xzoI8yvJCI2rJCrZ2XdcJnOU6yBo8VjTBZ
GJqd+Sut+LkAr0Ppem77Ec/qSv2inIOaeqG/nC+L4WGRq5g7vLnlnBZdYAfFOaqg
0ak7f/VS4qnU22CrToH0XDb9kh21u8EgDH+57jy5/SCit5sTzekL0qsXpSLNGhrL
OvbglBlEnSZPhxk+a91OTSA=
-----END CERTIFICATE-----`


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
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
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
