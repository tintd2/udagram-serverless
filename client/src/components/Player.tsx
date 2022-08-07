// import dateFormat from 'dateformat'
import { History } from 'history'
// import update from 'immutability-helper'
import { Form, Button, Icon, Divider, Image } from 'semantic-ui-react'
import * as React from 'react'
import { Grid, Header, Loader } from 'semantic-ui-react'
import ReactPlayer from 'react-player'
import { uploadFile } from '../api/todos-api'
import Auth from '../auth/Auth'
import { createVideo, deleteVideo, getUploadUrl, getVideos } from '../api/videos-api'
import { Video } from '../types/videos/Video'

// import Auth from '../auth/Auth'
// import { Todo } from '../types/Todo'

interface PlayersProps {
  auth: Auth
  history: History
}

interface PlayerState {
  videos: Video[],
  loadingVideos: boolean
  file: any
  uploadState: UploadState,
  newVideoTitle: string
}

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

export class Player extends React.PureComponent<PlayersProps, PlayerState> {
  // state: PlayerState = {
  //   loadingVideos: true
  // }

  state: PlayerState = {
    videos: [],
    file: undefined,
    loadingVideos: true,
    uploadState: UploadState.NoUpload,
    newVideoTitle: ''
  }

  async componentDidMount() {
    try {
      const videos = await getVideos(this.props.auth.getIdToken())
      this.setState({
        videos,
        loadingVideos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Player</Header>

        <div>
          <h1>Upload new video</h1>

          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <label>Title</label>
              <input type="text" placeholder="Title" required
                onChange={this.handleTitleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="video/mp4,video/x-m4v,video/*"
                placeholder="Video to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>
            {this.renderButton()}
          </Form>
          {this.renderVideos()}
        </div>

      </div>
    )
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVideoTitle: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)

      const newVideo = await createVideo(this.props.auth.getIdToken(), {
        title: this.state.newVideoTitle,
      })

      console.log(newVideo.title);

      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newVideo.videoId);

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {this.state.uploadState === UploadState.UploadingFile && (
          <p>Uploading file</p>
        )}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  renderVideos() {
    if (this.state.loadingVideos) {
      return this.renderLoading()
    }

    return this.renderVideosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Videos
        </Loader>
      </Grid.Row>
    )
  }

  renderVideosList() {
    return (
      <Grid padded>
        {this.state.videos.map((video) => {
          return (
            <Grid.Row key={video.videoId}>
              <Grid.Column width={10} verticalAlign="middle">
                {video.title}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVideoDelete(video.videoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {video.url && (
                <ReactPlayer url={video.url} /> 
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  onVideoDelete = async (videoId: string) => {
    try {
      await deleteVideo(this.props.auth.getIdToken(), videoId)
      this.setState({
        videos: this.state.videos.filter(video => video.videoId !== videoId)
      })
    } catch {
      alert('Video deletion failed')
    }
  }
}
