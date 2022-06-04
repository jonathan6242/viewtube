import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../components/VideoList.css"
import VideoThumbnail from "../components/VideoThumbnail";
import { db } from "../firebase";
import { selectUser } from "../slices/userSlice";

function Subscriptions() {
  const user = useSelector(selectUser)
  const [videos, setVideos] = useState('');
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if(user) {
      setLoading(true)
      async function loadPage() {
        const response = await getDocs(collection(db, "videos"))
        let data = response.docs.map((doc) => ({...doc.data(), id: doc.id}));
        data = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        data = data.slice().filter(video => video?.user?.subscribers.includes(user?.uid))
        if(!videos || videos.length === 0) {
          setVideos(data)
        }
      }
      loadPage();
      setTimeout(() => {
        setLoading(false)
      }, 300)
    }
  }, [user])
  
  const filter = ({ target: {value} }) => {
    if(videos.length > 0) {
      switch(value) {
        case 'NEWEST':
          setVideos(videos.slice().sort((a, b) => b.timestamp.seconds - a.timestamp.seconds))
          return
        case 'OLDEST':
          setVideos(videos.slice().sort((a, b) => a.timestamp.seconds - b.timestamp.seconds))
          return
        case 'POPULAR':
          setVideos(videos.slice().sort((a, b) => b.views - a.views))
          return
        }
    }
  
  }

  
  return (
    <div className="videos">
      <div className="videos__header" defaultValue="NEWEST">
        <div className="videos__header--title">
          Subscriptions
        </div>
        <select onChange={filter}>
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="POPULAR">Most popular</option>
        </select>
      </div>
      <div className="videos__list">
        {
          loading && new Array(12).fill(0).map((_, index) => <VideoThumbnail key={index} skeleton />)
        }
        {
          (videos && !loading) && (
            <>
              {
                videos.map(video => {
                  return (
                    <VideoThumbnail
                      videoObject={{...video, id: video.id}}
                      key={video.id}
                    />
                  )
                })
              }
            </>
          )
        }
      </div>
    </div>
  )
}
export default Subscriptions