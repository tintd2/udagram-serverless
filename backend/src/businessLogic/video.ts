import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { VideoItem } from '../models/videos/VideoItem'
import { VideosAccess } from '../dataLayer/videoAccess'
import { CreateVideoRequest } from '../requests/videos/CreateVideoRequest'
const logger = createLogger('videoLogic')
const videoAccess = new VideosAccess()

export async function createVideo(
  videoInput: CreateVideoRequest,
  userId: string
): Promise<VideoItem> {
  logger.info(`Creating new video ${videoInput.title}`)
  const videoId = uuid.v4()

  const bucketName = process.env.ATTACHMENT_S3_BUCKET
  const video = {
    videoId: videoId,
    userId: userId,
    title: videoInput.title,
    createdAt: new Date().toISOString(),
    url: `https://${bucketName}.s3.amazonaws.com/${videoId}`
  }
  const rst: VideoItem = await videoAccess.createVideo(video)
  return rst
}

export async function getVideosForUser(userId: string): Promise<VideoItem[]> {
  return await videoAccess.getAllVideos(userId)
}

export async function getVideo(
  videoId: string,
  userId: string
): Promise<VideoItem> {
  return await videoAccess.getVideo(videoId, userId)
}


export async function deleteVideo(video: VideoItem): Promise<boolean> {
  return await videoAccess.deleteVideo(video)
}