import { useParams } from "react-router-dom"
import "./CreateVideo.css"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { auth, db } from "../firebase"
import { selectUser } from "../slices/userSlice"
import { serverTimestamp, collection, updateDoc, getDoc, doc, Timestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"

function EditVideo() {
  const { id } = useParams();
  const user = useSelector(selectUser)
  const [thumbnail, setThumbnail] = useState('')
  const [video, setVideo] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const getVideo = async () => {
      setLoading(true)
      const docSnap = await getDoc(doc(db, "videos", id))
      const video = docSnap.data();
      setSelectedVideo(video);
      setTitle(video.title);
      setThumbnail(video.thumbnail)
      setVideo(video.video.replace('-nocookie', '').replace('embed/', 'watch?v='));
      setLoading(false)
    }
    getVideo();
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault();
    if(!user || auth?.currentUser?.uid !== selectedVideo?.user?.uid) {
      toast.error('Cannot edit someone else\'s video', {theme: "colored"})
      navigate('/')
      return;
    }
    setLoading(true)
    if (!thumbnail.toLowerCase().includes('http')) {
      toast.error('Invalid Thumbnail URL', {theme: "colored"})
      setLoading(false)
      return;
    } else if (!video.toLowerCase().includes('youtube.com')) {
      toast.error('Invalid YouTube Video URL', {theme: "colored"})
      setLoading(false)
      return;
    } else {
      const videoCopy = {
        ...selectedVideo,
        video: convertYoutubeURL(video),
        title,
        thumbnail,
        timestamp: new Timestamp(selectedVideo.timestamp.seconds, selectedVideo.timestamp.nanoseconds)
      }
      setVideo('');
      setThumbnail('');
      setTitle('');
      await updateDoc(doc(db, "videos", id), videoCopy)
      navigate('/')
      // navigate('/videos')
      // navigate('/videos')
      setLoading(false)
      toast.success('Successfully edited video.', {theme: "colored"});
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
          Edit Video
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
            // onClick={(e) => e.target.value}
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
        <button className="video-form__submit edit" type="submit">Save Changes</button>
      </form>
      {
        loading && (
          <Spinner />
        )
      }
    </div>
  )
}
export default EditVideo