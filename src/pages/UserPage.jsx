import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "../components/VideoList.css"
import VideoThumbnail from "../components/VideoThumbnail";
import { db } from "../firebase";
import { selectUser } from "../slices/userSlice";
import "./UserPage.css"

function UserPage() {
  const user = useSelector(selectUser)
  const [videos, setVideos] = useState('');
  const [loading, setLoading] = useState(false)
  const [channel, setChannel] = useState('');
  const [users, setUsers] = useState('');
  const { uid } = useParams();

  useEffect(() => {
    setLoading(true)
    const usersData = JSON.parse(localStorage.getItem("users"))
    setUsers(usersData)
    setChannel(usersData.find(item => item.uid === uid));
    let data = JSON.parse(localStorage.getItem("videos"));
    data = data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
    data = data.filter(video => video.user.uid === uid)
    if(!videos || videos.length === 0) {
      setVideos(data)
    }
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }, [])
  
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

  const subscribe = async () => {
    if(!user) {
      alert("You must sign in to subscribe.")
      return;
    }
    let subscribers = channel?.subscribers;
    if(subscribers.includes(user?.uid)) {
      subscribers = subscribers.filter(item => item != user?.uid);
    } else {
      subscribers.push(user.uid)
    }
    const channelCopy = {...channel}
    setChannel({
      ...channel,
      subscribers
    })
    // Update users collection
    await updateDoc(
      doc(db, "users", channel.id),
      {
        ...channelCopy,
        subscribers
      }
    )
  }

  useEffect(() => {
    if(channel && users) {
      // Update videos collection
      const videos = JSON.parse(localStorage.getItem("videos"))
      async function updateVideoSubscribers() {
        for(let vid of videos) {
          if(vid.user.uid === channel.uid) {
            await updateDoc(
              doc(db, "videos", vid.id),
              {
                ...vid,
                user: channel
              }
            )
          }
        }
      }
      updateVideoSubscribers();
      // Update users local storage
      localStorage.setItem("users", JSON.stringify(
        users?.map(user => {
          if(user?.id === channel?.id) {
            return channel
          } else {
            return user
          }
        })
      ))
    } 
  }, [channel])
  
  return (
    <div className="videos">
      <div className="user__about">
        <div className="user__about--left">
          <figure className="user__profile">
            <img src={channel?.photoURL} alt="" />
          </figure>
          <div className="user__info">
            <h2 className="user__name">{channel?.displayName}</h2>
            <span className="user__subscribers">{channel?.subscribers?.length} subscribers</span>
          </div>
        </div>
        {
          channel && (
            channel?.uid !== user?.uid && (
            <button onClick={subscribe} className={`video-page__subscribe ${channel?.subscribers?.includes(user?.uid) && 'unsubscribe'}`}>
              {
                channel?.subscribers.includes(user?.uid)
                ? "Subscribed"
                : "Subscribe"
              }
            </button>
          )
          )
        }
      </div>
      <div className="videos__header" defaultValue="NEWEST">
        <div className="videos__header--title">
          Videos by User
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
export default UserPage