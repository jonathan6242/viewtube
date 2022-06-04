import "./CreateVideo.css"
import { useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase"
import { selectUser } from "../slices/userSlice"
import { serverTimestamp, collection, addDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"

function CreateVideo({ videosByUser }) {
  const user = useSelector(selectUser)
  const [thumbnail, setThumbnail] = useState('')
  const [video, setVideo] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate('')

  const onSubmit = async (e) => {
    e.preventDefault();
    if(!user) {
      toast.error('Must sign in to create video', {theme: "colored"})
      navigate('/')
      return;
    }
    setLoading(true)
    if(videosByUser > 2 && user.uid !== "27sO7M2yPfPEkpCa7tzP00e4euy2") {
      toast.error('Sorry, you can only upload a maximum of 3 videos.', {theme: "colored"})
      setLoading(false)
      return;
    } else if (!thumbnail.toLowerCase().includes('http')) {
      toast.error('Invalid Thumbnail URL', {theme: "colored"})
      setLoading(false)
      return;
    } else if (!video.toLowerCase().includes('youtube.com')) {
      toast.error('Invalid YouTube Video URL', {theme: "colored"})
      setLoading(false)
      return;
    } else {
      const newVideo = {
        thumbnail,
        video: convertYoutubeURL(video),
        title,
        user,
        timestamp: serverTimestamp(),
        views: 0,
        likedBy: [],
        dislikedBy: []
      }
      setVideo('');
      setThumbnail('');
      setTitle('');
      await addDoc(collection(db, "videos"), newVideo)
      navigate('/')
      setLoading(false)
      toast.success('Successfully created video.', {theme: "colored"});
    }
  }

  const convertYoutubeURL = (originalURL) => {
    const startIndex = originalURL.indexOf('?v=') + 3;
    if(originalURL.includes('&')) {
      let endIndex = originalURL.indexOf('&');
      return `https://www.youtube-nocookie.com/embed/${originalURL.slice(startIndex, endIndex)}`
    } else {
      return `https://www.youtube-nocookie.com/embed/${originalURL.slice(startIndex)}`
    }
  }

  return (
    <div className="videos">
      <div className="videos__header">
        <div className="videos__header--title">
          Create Video
        </div>
      </div>
      <form onSubmit={onSubmit} className="create-video">
        <div className="video-form__inputs">
          <label className="video-form__label">Thumbnail</label>
          <input 
            type="text"
            value={thumbnail}
            onChange={(e) => {setThumbnail(e.target.value)}}
            placeholder="Thumbnail URL"
            required
          />
          <label className="video-form__label">Video</label>
          <input
            type="text"
            value={video}
            onChange={(e) => {setVideo(e.target.value)}}
            onClick={(e) => convertYoutubeURL(e.target.value)}
            placeholder="YouTube Video URL"
            required
          />
          <label className="video-form__label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {setTitle(e.target.value)}}
            placeholder="Video Title"
            required
          />
        </div>
        <button className="video-form__submit" type="submit">Create Video</button>
      </form>
      {
        loading && (
          <Spinner />
        )
      }
    </div>
  )
}
export default CreateVideo