import { Link } from "react-router-dom";
import "./VideoThumbnail.css"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase";

function VideoThumbnail({ videoObject, recommended, loadPage, setLoading, skeleton }) {
  const handleClick = async () => {
    // Selected video has one less view than video in database
    localStorage.setItem("selectedVideo", JSON.stringify({
      ...videoObject,
      views: videoObject.views + 1
    }));
    await addView()
  }

  // Add view to video
  const addView = async () => {
    await updateDoc(
      doc(db, "videos", videoObject.id),
      {
        thumbnail: videoObject.thumbnail,
        video: videoObject.video,
        title: videoObject.title,
        user: videoObject.user,
        timestamp: videoObject.timestamp,
        likedBy: videoObject.likedBy,
        dislikedBy: videoObject.dislikedBy,
        views: videoObject.views + 1
      }
    )
  }

  function toDateTime(seconds) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(seconds);
    return t;
  }

  if(skeleton) {
    return (
      <>
      {
        !recommended ? (
          <div className="video-thumbnail__container skeleton">
            <div className="video-thumbnail skeleton">
              <div className="video-thumbnail__image skeleton" style={{
                  backgroundImage: `url("https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg")`
                }}>
              </div>
              <div className="video-thumbnail__bottom">
                <figure className="video-thumbnail__profile skeleton">
                  <img src="https://lh3.googleusercontent.com/ogw/ADea4I6GLRyjbp-NZFIZ8xkTwCf8qhne7Zu7OeOoieAk=s32-c-mo" alt="" />
                </figure>
                <div className="video-thumbnail__description">
                  <div className="video-thumbnail__title skeleton"></div>
                  <p className="video-thumbnail__name skeleton"></p> 
                  <p className="video-thumbnail__info skeleton"></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="video-thumbnail__container recommended skeleton">
            <div className="video-thumbnail recommended skeleton">
              <div className="video-thumbnail__image--wrapper">
                <div className="video-thumbnail__image recommended skeleton" style={{
                  backgroundImage: `url("https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg")`
                }}>
                </div>
              </div>
              <div className="video-thumbnail__bottom recommended">
                <figure className="video-thumbnail__profile">
                  <img src="https://lh3.googleusercontent.com/ogw/ADea4I6GLRyjbp-NZFIZ8xkTwCf8qhne7Zu7OeOoieAk=s32-c-mo" alt="" />
                </figure>
                <div className="video-thumbnail__description">
                  <div className="video-thumbnail__title recommended skeleton">Skeleton</div>
                  <p className="video-thumbnail__name recommended skeleton">Skeleton</p> 
                  <p className="video-thumbnail__info recommended skeleton">Skeleton</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
      </>
    )
   
  }

  return (
    <>
      {
        !recommended ? (
          <div className="video-thumbnail__container">
          <Link onClick={handleClick} to={`/videos`}>
            <div className="video-thumbnail">
              <div className="video-thumbnail__image" style={{
                  backgroundImage: `url(${videoObject?.thumbnail})`
                }}>
                {/* <img src={videoObject?.thumbnail} alt="" /> */}
              </div>
              <div className="video-thumbnail__bottom">
                <figure className="video-thumbnail__profile">
                  <img src={videoObject?.user.photoURL} alt="" />
                </figure>
                <div className="video-thumbnail__description">
                  <div className="video-thumbnail__title">
                    {videoObject?.title}
                  </div>
                  <p className="video-thumbnail__name">{videoObject?.user.displayName}</p> 
                  <p>{videoObject?.views} views • {toDateTime(videoObject?.timestamp?.seconds).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Link>
          </div>
        ) : (
          <div className="video-thumbnail__container recommended">
            <Link onClick={() => {
              handleClick();
              setLoading(true);
              loadPage();
            }} to={`/videos`}>
              <div className="video-thumbnail recommended">
                <div className="video-thumbnail__image--wrapper">
                  <div className="video-thumbnail__image recommended" style={{
                    backgroundImage: `url(${videoObject?.thumbnail})`
                  }}>
                    {/* <img src={videoObject?.thumbnail} alt="" /> */}
                  </div>
                </div>
                <div className="video-thumbnail__bottom recommended">
                  <figure className="video-thumbnail__profile">
                    <img src={videoObject?.user.photoURL} alt="" />
                  </figure>
                  <div className="video-thumbnail__description">
                    <div className="video-thumbnail__title">
                      {videoObject?.title}
                    </div>
                    <p className="video-thumbnail__name">{videoObject?.user.displayName}</p> 
                    <p>{videoObject?.views} views • {toDateTime(videoObject?.timestamp?.seconds).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )
      }
    </>
  
  )
}

export default VideoThumbnail