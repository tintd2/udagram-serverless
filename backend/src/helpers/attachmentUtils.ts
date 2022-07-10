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

const s3 = new XAWS.S3({
  signatureVersion: 'v4',
  region: 'us-east-1',
  accessKeyId: 'AKIAZV7Q3ZBD6DYRHJFH',
  secretAccessKey: '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',
})

export function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  })
}


export function getSignedUrlPromise(todoId: string) {
  const params = {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  };
  console.log('params', params)
  return s3.getSignedUrlPromise('putObject', params)
}
