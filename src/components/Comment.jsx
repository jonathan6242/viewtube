import { Link } from "react-router-dom";
import "./Comment.css"

function Comment({ comment }) {
  const {
    text,
    timestamp,
    user
  } = comment;

  function toDateTime(seconds) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(seconds);
    return t;
  }

  return (
    <div className="comment">
      <Link to={`/users/${user?.uid}`} className="comment__profile">
        <img src={user.photoURL} alt="" />
      </Link>
      <div className="comment__body">
        <div className="comment__author">
          <span>{user.displayName}</span>&nbsp;-&nbsp;
          <div className="comment__date">
            {toDateTime(timestamp?.seconds).toLocaleString()}
          </div>
        </div>
        <div className="comment__text">{text}</div>
      </div>
    </div>
  )
}
export default Comment