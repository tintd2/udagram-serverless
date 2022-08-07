import { apiEndpoint } from '../config'
import Axios from 'axios'
import { CreateVideoRequest } from '../types/videos/CreateVideoRequest'
import { Video } from '../types/videos/Video'

export async function createVideo(
  idToken: string,
  newVideo: CreateVideoRequest
): Promise<Video> {
  const response = await Axios.post(
    `${apiEndpoint}/videos`,
    JSON.stringify(newVideo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  console.log('response', response)
  return response.data.item
}

export async function getUploadUrl(
  idToken: string,
  videoId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/videos/${videoId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function getVideos(idToken: string): Promise<Video[]> {
  console.log('Fetching video')

  const response = await Axios.get(`${apiEndpoint}/videos`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Videos:', response.data)
  return response.data.items
}

export async function deleteVideo(
  idToken: string,
  videoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/videos/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}
