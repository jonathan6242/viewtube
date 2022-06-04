import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../components/VideoList.css"
import VideoThumbnail from "../components/VideoThumbnail";
import { db } from "../firebase";
import { selectUser } from "../slices/userSlice";

function LikedVideos() {
  const user = useSelector(selectUser)
  const [videos, setVideos] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(user) {
      let data = JSON.parse(localStorage.getItem("videos"));
      data = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      data = data.filter(video => video.likedBy.includes(user?.uid));
      console.log(data)
      if(!videos) {
        setVideos(data)
      }
      setTimeout(() => {
        setLoading(false)
      }, 300)
    }
  }, [user])

  // useEffect(() => {
  //   if(!user) {
  //     navigate('/')
  //   }
  // }, [user])
  
  const filter = ({ target: {value} }) => {
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

  
  return (
    <div className="videos">
      <div className="videos__header" defaultValue="NEWEST">
        <div className="videos__header--title">
          Liked Videos
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
export default LikedVideos