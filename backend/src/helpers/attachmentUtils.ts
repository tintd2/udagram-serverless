import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// new AWS.Config({
//   accessKeyId: 'AKIAS3FXW4GLAH63TV5U',
//   secretAccessKey: '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',
//   region: 'us-east-1',
//   signatureVersion: 'v4'
// })
// TODO: Implement the fileStogare logic
// const groupsTable = process.env.GROUPS_TABLE
// const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const secretId = process.env.SECRET_NAME
const s3AccessKey = process.env.S3_ACCESS_KEY
const s3SecretKey = process.env.S3_SECRET_KEY

let accessKey: string;
let secretKey: string

let s3 = new XAWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1'
})

export function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  })
}

export async function getSignedUrlPromise(todoId: string) {
  if (!accessKey) {
    let secretManager = new XAWS.SecretsManager({ region: 'us-east-1' })
    const data = await secretManager
      .getSecretValue({ SecretId: secretId })
      .promise()
    const secret = JSON.parse(data.SecretString)
    console.log(secret)
    console.log(`data is: ${JSON.stringify(data.SecretString)}`)
    accessKey = secret[s3AccessKey]
    secretKey = secret[s3SecretKey]
    console.log(accessKey)
    console.log(secretKey)
  }
  s3 = new XAWS.S3({
    signatureVersion: 'v4',
    region: 'us-east-1',
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  })
  const params = {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  }
  return s3.getSignedUrlPromise('putObject', params)
}
