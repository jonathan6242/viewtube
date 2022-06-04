import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react"
import { useSelector } from "react-redux"
import { db } from "../firebase";
import { selectUser } from "../slices/userSlice";
import "./CommentForm.css"

function CommentForm({ videoID }) {
  const user = useSelector(selectUser)
  const [text, setText] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user) {
      alert('You must sign in to comment.')
      return;
    }
    const newComment = {
      text,
      user,
      timestamp: serverTimestamp()
    }
    await addDoc(
      collection(db, "videos", videoID, "comments"),
      newComment
    )
    setText('')
    setBtnDisabled(true)
  }

  // Disable button if input is empty, otherwise enable
  const handleChange = (e) => {
    setText(e.target.value)
    if(e.target.value !== '') {
      setBtnDisabled(false)
    } else {
      setBtnDisabled(true)
    }
  }

  return (
    <>
      <figure className="comment-list__profile">
        {
          user ? (
            <img src={user.photoURL} alt="" />
          ) : (
            <img src="https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max" alt="" />
          )
        }
      
      </figure>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={handleChange}
          type="text"
          placeholder="Add a comment..."
          resize="none"
        ></textarea>
        <div className="comment-form__buttons">
          {
            !btnDisabled && (
              <button 
                onClick={() => {setText(''); setBtnDisabled(true)}}
                className="cancel"
              >
                Cancel
              </button>
            )
          }
          <button
            className={`${!btnDisabled && 'btn-enabled'}`}
            type="submit"
            disabled={btnDisabled}
          >
            Comment
          </button>
        </div>
      </form>
    </>
  )
}
export default CommentForm