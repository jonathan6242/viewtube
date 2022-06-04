import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react";
import { db } from "../firebase";
import VideoThumbnail from "./VideoThumbnail";
import "./VideoList.css"
import { useSelector } from "react-redux";
import { selectUser } from "../slices/userSlice";

function VideoList({ term, setVideosByUser }) {
  const user = useSelector(selectUser)
  const [videos, setVideos] = useState('');
  const [searchVideos, setSearchVideos] = useState('');
  const [filterValue, setFilterValue] = useState('NEWEST');
  const [loading, setLoading] = useState(false)

  // Real-time listener for videos collection
  useEffect(() => {
    const getVideos = async () => {
      setLoading(true)
      const docSnap = await getDocs(
        query(
          collection(db, "videos"),
          orderBy("timestamp", "desc"),
          limit(64)
        )
      )
      let data = docSnap.docs.map(doc => ({...doc.data(), id: doc.id}));
      data = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      if(!videos) {
        localStorage.setItem("videos", JSON.stringify(data))
        setVideos(data)
        if(term !== "") {
          setSearchVideos(data.filter(video => video?.title?.toLowerCase().includes(term.toLowerCase())))
        }
      }
      setLoading(false)
    }
    getVideos();
  }, [])

  useEffect(() => {
    if(!videos) {
      return
    }
    if(term === '') {
      setSearchVideos('')
      switch(filterValue) {
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
    } else {
      setSearchVideos(videos.filter(video => video.title.toLowerCase().includes(term.toLowerCase())))
    }
  }, [term])

  useEffect(() => {
    if(user) {
      setVideosByUser(videos && videos.filter(video => video.user.uid === user.uid).length);
    }
  }, [user, videos])

  const filter = ({ target: {value} }) => {
    setFilterValue(value);
    if(!searchVideos) {
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
    } else {
      switch(value) {
        case 'NEWEST':
          setSearchVideos(searchVideos.slice().sort((a, b) => b.timestamp.seconds - a.timestamp.seconds))
          return
        case 'OLDEST':
          setSearchVideos(searchVideos.slice().sort((a, b) => a.timestamp.seconds - b.timestamp.seconds))
          return
        case 'POPULAR':
          setSearchVideos(searchVideos.slice().sort((a, b) => b.views - a.views))
          return
      }
    }
  }

  return (
    <div className="videos">
      <div className="videos__header" defaultValue="NEWEST">
        <div></div>
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
                !searchVideos ? (
                  videos.map(video => {
                    return (
                      <VideoThumbnail
                        videoObject={{...video, id: video.id}}
                        key={video.id}
                      />
                    )
                  })
                ) : (
                  searchVideos.map(video => {
                    return (
                      <VideoThumbnail
                        videoObject={{...video, id: video.id}}
                        key={video.id}
                      />
                    )
                  })
                )
              }
            </>
          )
          
   
        }
      </div>
    </div>
  )
}

export default VideoList