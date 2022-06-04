import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import Comment from "./Comment"
import CommentForm from "./CommentForm"
import "./CommentList.css"

function CommentList({ videoID }) {
  const [comments, setComments] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "videos", videoID, "comments"), orderBy("timestamp", "desc")),
      snapshot => {
        const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
        setComments(data)
      }
    )
    return unsubscribe
  }, [])

  return (
    <div className="comment-list">
      <h2 className="comment-list__title">
        {comments.length} Comments
      </h2>
      <div className="comment-list__form">
        <CommentForm videoID={videoID} />
      </div>
      <div className="comment-list__comments">
        {comments && comments.map(comment => <Comment key={comment.id} comment={comment} />)}
      </div>
    
    </div>
  )
}
export default CommentList