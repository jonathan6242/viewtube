import { useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase"
import { selectUser } from "../slices/userSlice"
import { serverTimestamp, collection, addDoc } from "firebase/firestore"
import "./VideoForm.css"
import { useNavigate } from "react-router-dom"


function VideoForm({ videosByUser }) {
  const user = useSelector(selectUser)
  const [thumbnail, setThumbnail] = useState('')
  const [video, setVideo] = useState('')
  const [title, setTitle] = useState('')
  const navigate = useNavigate('')

  // Add video to videos collection
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(videosByUser > 4 && user.uid !== "27sO7M2yPfPEkpCa7tzP00e4euy2") {
      alert('Sorry, you can only upload a maximum of 5 videos.')
      return;
    } else {
      toggleForm();
      navigate('/')
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
    
    }
  }

  // Convert normal YouTube URL to embedded URL
  const convertYoutubeURL = (originalURL) => {
    const startIndex = originalURL.indexOf('?v=') + 3;
    if(originalURL.includes('&')) {
      let endIndex = originalURL.indexOf('&');
      return `https://www.youtube-nocookie.com/embed/${originalURL.slice(startIndex, endIndex)}`
    } else {
      return `https://www.youtube-nocookie.com/embed/${originalURL.slice(startIndex)}`
    }
  }

  const toggleForm = () => {
    document.body.classList.toggle('create')
  }

  return (
    <div className="video-form__container">
      <form onSubmit={handleSubmit} className="video-form">
        <i className="fa-solid fa-times" onClick={toggleForm}></i>
        <h2>Create a video</h2>
        <div className="video-form__inputs">
          <input 
            type="text"
            value={thumbnail}
            onChange={(e) => {setThumbnail(e.target.value)}}
            placeholder="Youtube Thumbnail URL..."
            required
          />
          <input
            type="text"
            value={video}
            onChange={(e) => {setVideo(e.target.value)}}
            onClick={(e) => convertYoutubeURL(e.target.value)}
            placeholder="Youtube Video URL..."
            required
          />
          <input
            type="text"
            value={title}
            onChange={(e) => {setTitle(e.target.value)}}
            placeholder="Video Title..."
            required
          />
        </div>
        <button type="submit">Create Video</button>
      </form>
    </div>
  )
}
export default VideoForm