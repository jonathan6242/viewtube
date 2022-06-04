import { useEffect, useState } from "react";
import "./VideoPage.css"
import { useSelector } from "react-redux";
import { selectUser } from "../slices/userSlice";
import { deleteDoc, doc, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase";
import CommentList from "../components/CommentList"
import VideoThumbnail from "../components/VideoThumbnail";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

function VideoPage() {
  const user = useSelector(selectUser)
  const [video, setVideo] = useState('')
  const [users, setUsers] = useState('')
  const [videoCreator, setVideoCreator] = useState('')
  const [recommendedVideos, setRecommendedVideos] = useState('')
  const [ratio, setRatio] = useState('')
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(true)
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Retrieve selected video from local storage
  useEffect(() => {
    loadPage()
  }, [])

  const loadPage = async () => {
    const videoObject = JSON.parse(localStorage.getItem("selectedVideo"))
    let videos = JSON.parse(localStorage.getItem("videos"))
    videos = videos.filter(video => video.id !== videoObject.id)
    const usersData = JSON.parse(localStorage.getItem("users"));
    setVideo(videoObject)
    setUsers(usersData)
    setRecommendedVideos(videos)
    setCommentsVisible(false)
    setTimeout(() => {
      const videoCreator = usersData?.find(item => item?.uid === videoObject?.user?.uid);
      setVideoCreator(videoCreator)
    }, 300)
    setTimeout(() => {
      setCommentsVisible(true)
    }, 300)
    setTimeout(() => {
      setLoading(false)
    }, 600)
  }

  // Whenever the video statistics change, change the video in local storage
  useEffect(() => {
    if(video?.likedBy?.length !== 0 && video?.dislikedBy?.length !== 0) {
      setRatio((100 * video?.likedBy?.length) / (video?.likedBy?.length + video?.dislikedBy?.length))
    } else if (video?.likedBy?.length === 0 && video?.dislikedBy?.length !== 0) {
      setRatio(0)
    } else if (video?.dislikedBy?.length === 0 && video?.likedBy.length !== 0) {
      setRatio(100)
    } else {
      setRatio(50)
    }
    if(video) {
      localStorage.setItem("selectedVideo", JSON.stringify(video))
      localStorage.setItem("videos", JSON.stringify([
        ...recommendedVideos,
        video
      ]))
    }
  }, [video])

  // Like video
  const likeVideo = async () => {
    if(!user) {
      toast.info('You must sign in to like videos.', {theme: "colored"});
      return;
    }
    let newLikes = video.likedBy;
    let newDislikes = video.dislikedBy;
    if(newLikes.includes(user.uid)) {
      newLikes = newLikes.filter(item => item !== user.uid)
    } else {
      newLikes.push(user.uid)
      if(newDislikes.includes(user.uid)) {
        newDislikes = newDislikes.filter(item => item !== user.uid)
      }
    }
    const videoCopy = {
      ...video, 
      timestamp: new Timestamp(video.timestamp.seconds, video.timestamp.nanoseconds)
    }
    setVideo((previousVideo) => {
      return {
        ...previousVideo,
        likedBy: newLikes,
        dislikedBy: newDislikes
      }
    })
    await updateDoc(
      doc(db, "videos", video.id),
      {
        ...videoCopy,
        likedBy: newLikes,
        dislikedBy: newDislikes
      }
    )
  }

  // Dislike video
  const dislikeVideo = async () => {
    if(!user) {
      toast.info('You must sign in to dislike videos.', {theme: "colored"});
      return;
    }
    let newDislikes = video.dislikedBy;
    let newLikes = video.likedBy;
    if(video.dislikedBy.includes(user.uid)) {
      newDislikes = newDislikes.filter(item => item !== user.uid)
    } else {
      newDislikes.push(user.uid)
      if(newLikes.includes(user.uid)) {
        newLikes = newLikes.filter(item => item !== user.uid)
      }
    }
    const videoCopy = {
      ...video, 
      timestamp: new Timestamp(video.timestamp.seconds, video.timestamp.nanoseconds)
    }
    setVideo((previousVideo) => {
      return {
        ...previousVideo,
        likedBy: newLikes,
        dislikedBy: newDislikes
      }
    })
    await updateDoc(
      doc(db, "videos", video.id),
      {
        ...videoCopy,
        likedBy: newLikes,
        dislikedBy: newDislikes
      }
    )
  }

  // Subscribe to a user
  const subscribe = async () => {
    if(!user) {
      toast.info("You must sign in to subscribe.", {theme: "colored"})
      return;
    }
    let subscribers = videoCreator?.subscribers;
    if(subscribers.includes(user?.uid)) {
      subscribers = subscribers.filter(item => item != user?.uid);
    } else {
      subscribers.push(user.uid)
    }
    const videoCreatorCopy = {...videoCreator}
    setVideoCreator({
      ...videoCreator,
      subscribers
    })
    await updateDoc(
      doc(db, "users", videoCreator.id),
      {
        ...videoCreatorCopy,
        subscribers
      }
    )
  }

  useEffect(() => {
    const updateSubscribers = async () => {
      if(videoCreator && video) {
        const videoCopy = {
          ...video, 
          timestamp: new Timestamp(video.timestamp.seconds, video.timestamp.nanoseconds)
        }
        setVideo({
          ...videoCopy,
          user: videoCreator
        })
        // Update users local storage
        localStorage.setItem("users", JSON.stringify(
          users?.map(user => {
            if(user.id === videoCreator.id) {
              return videoCreator
            } else {
              return user
            }
          })
        ))
        
        const videos = JSON.parse(localStorage.getItem("videos"));
        // Update videos collection
        async function updateVideoSubscribers() {
          for(let vid of videos) {
            if(vid.user.uid === videoCreator.uid) {
              await updateDoc(
                doc(db, "videos", vid.id),
                {
                  ...vid,
                  user: videoCreator,
                  timestamp: new Timestamp(vid?.timestamp?.seconds, vid?.timestamp?.nanoseconds)
                }
              )
            }
          }
        }
        updateVideoSubscribers();
      }
    }
    updateSubscribers();
  }, [videoCreator])

  function toDateTime(seconds) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(seconds);
    return t;
  }

  const deleteVideo = async () => {
    if(window.confirm('Are you sure you want to delete?')) {
      if(user?.uid !== video?.user?.uid) {
        navigate('/')
        toast.error('Cannot delete another user\'s video', {theme: "colored"});
        return;
      }
      setDeleting(true);
      await deleteDoc(doc(db, "videos", video.id))
      navigate('/')
      setDeleting(false)
      toast.success('Successfully deleted video.', {theme: "colored"})
    }
  }

  return (
    <div className="video-page">
      {
        deleting && (
          <Spinner />
        )
      }
      {
        video && (
          <>
            <div className="video-page__left">
              <div className="video-page__video">
                <iframe
                  allow="fullscreen;"
                  autoPlay="1"
                  title="Video"
                  src={video.video}
                >
                </iframe>
                <div className="video-page__skeleton" style={{
                  display: `${loading ? 'block' : 'none'}`
                }}>       
                </div>
              </div>
              <div className="video-page__info">
                {
                  loading ? (
                    <>
                      <div className="video-page__title skeleton"></div>
                      <div className="video-page__statistics">
                        <div>
                          <span className="video-page__info skeleton"></span>
                          <div className="video-page__ratings">
                            <div className="skeleton__circle"></div>
                            <div className="skeleton__circle"></div>
                            <div className="skeleton__circle"></div>
                          </div>
                        </div>
                      </div>
                      <div className="video-page__description">
                        <div className="video-page__description--left">
                          <div className="video-page__profile skeleton">
                            <img src={videoCreator?.photoURL} alt="" />
                          </div>
                          <h2 className="video-page__name skeleton"></h2>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="video-page__title">{video.title}</div>
                      <div className="video-page__statistics">
                        <div>
                          <span>{video.views} views • {toDateTime(video.timestamp.seconds).toLocaleString()}</span>
                          <div className="video-page__ratings">
                            <div className="video-page__likes">
                              <i onClick={likeVideo} className="fas fa-thumbs-up"></i>
                              <span>{video?.likedBy?.length}</span>
                            </div>
                            <div className="video-page__dislikes">
                              <i onClick={dislikeVideo} className="fas fa-thumbs-down"></i>
                              <span>{video?.dislikedBy?.length}</span>
                            </div>
                            <div className="video-page__likes--bar" style={{
                              width: 
                              `${ratio}%`
                            }}></div>
                            <div className="video-page__dislikes--bar"></div>
                          </div>
                        </div>
                        {
                          (user?.uid === video?.user?.uid || user?.uid === "27sO7M2yPfPEkpCa7tzP00e4euy2") && (
                            <div id="video-page__buttons">
                              <Link to={`/editvideo/${video?.id}`} className="edit">
                                <i className="fa-solid fa-edit"></i>
                              </Link>
                              <button onClick={deleteVideo} className="delete">
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          )
                        }
                      </div>
                      <div className="video-page__description">
                        <div className="video-page__description--left">
                          <Link to={`/users/${videoCreator?.uid}`} className="video-page__profile">
                            <img src={videoCreator?.photoURL} alt="" />
                          </Link>
                          <div className="video-page__user">
                            <h2>{videoCreator?.displayName}</h2>
                            <span className="video-page__subscribers">{videoCreator?.subscribers?.length} subscribers</span>
                          </div>
                        </div>
                        {
                          videoCreator?.uid !== user?.uid && (
                            <button onClick={subscribe} className={`video-page__subscribe ${videoCreator?.subscribers.includes(user?.uid) && 'unsubscribe'}`}>
                              {
                                videoCreator?.subscribers.includes(user?.uid)
                                ? "Subscribed"
                                : "Subscribe"
                              }
                            </button>
                          )
                        }
                     
                      </div>
                    </>
                  )
                }
         
                {
                  commentsVisible &&  <CommentList videoID={video?.id} />
                }
                {
                  !commentsVisible && <div className="comment-list__skeleton"></div>
                }
              </div>
            </div>
            <div className="video-page__right">
              {
                loading && (
                  new Array(12).fill(0).map((_, index) => {
                    return (
                      <VideoThumbnail
                        key={index}
                        recommended
                        skeleton
                      />
                    )
                  })
                )
              }
              {
                !loading && (
                  <>
                    {
                      recommendedVideos.length > 10 ? (
                        recommendedVideos.slice(0, 10).map(video => {
                          return (
                            <VideoThumbnail
                              setLoading={setLoading}
                              loadPage={loadPage}
                              videoObject={video}
                              key={video.id}
                              recommended
                            />
                          )
                        })
                      ) : (
                        recommendedVideos.map(video => {
                          return (
                            <VideoThumbnail
                              setLoading={setLoading}
                              loadPage={loadPage}
                              videoObject={video}
                              key={video.id}
                              recommended
                            />
                          )
                        })
                      )
                    }
                  </>
                )
                

              }
            </div>
          </>
        )
      }
    </div>
  )
}
export default VideoPage