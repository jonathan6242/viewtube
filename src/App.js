import { auth, db, provider } from "./firebase"
import "./App.css"
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "./slices/userSlice"
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { login, logout } from "./slices/userSlice";
import { useEffect, useState } from "react";
import VideoForm from "./components/VideoForm"
import VideoList from "./components/VideoList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import VideoPage from "./pages/VideoPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LikedVideos from "./pages/LikedVideos";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import Subscriptions from "./pages/Subscriptions";
import UserPage from "./pages/UserPage";

function App() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch();
  const [term, setTerm] = useState('');
  const [userLoading, setUserLoading] = useState(true)
  const [videosByUser, setVideosByUser] = useState(0);
  const [signedIn, setSignedIn] = useState(false)

  // Get users collection and store in state
  async function getUsers() {
    const data = await getDocs(collection(db, "users"));
    const users = data.docs.map((doc) => ({ ...doc.data(), id: doc.id}))
    return users;
  }

  // Get user on page load and store in state
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      console.log('OnAuthStateChanged')
      console.log(user ? user.displayName : 'No user')
      let users = await getUsers();
      localStorage.setItem("users", JSON.stringify(users));
      // if(!localStorage.getItem("users") || !JSON.parse(localStorage.getItem("users"))) {
      //   console.log('Fetched users from cloud');
      //   users = await getUsers();
      //   localStorage.setItem("users", JSON.stringify(users));
      // } else {
      //   users = JSON.parse(localStorage.getItem("users"));
      // }
      if(user) {
        console.log(users)
        let currentUser = users.find(item => item.uid === user.uid);
        if(!currentUser) {
          console.log("New user:", user.displayName)
          currentUser = {
            displayName: user?.displayName,
            email: user?.email,
            photoURL: user?.photoURL,
            uid: user?.uid,
            subscribers: []
          }
          await addDoc(collection(db, "users"), currentUser);
          users = await getUsers()
          console.log("New users:", users)
          localStorage.setItem("users", JSON.stringify(users))
        }
        dispatch(login(currentUser))
      }
      setTimeout(() => {
        setUserLoading(false)
      }, 1000)
    });
  }, [])

  // Sign in with Google OAuth
  const signin = () => {
    signInWithPopup(auth, provider)
      .then(async ({ user }) => {
        // if(user) {
        //   let users = await getUsers();
        //   const userExists = users.filter(item => item.uid === user.uid).length > 0;
        //   let currentUser;
        //   if(!userExists) {
        //     console.log("New user.")
        //     currentUser = {
        //       displayName: user?.displayName,
        //       email: user?.email,
        //       photoURL: user?.photoURL,
        //       uid: user?.uid,
        //       subscribers: []
        //     }
        //     await addDoc(collection(db, "users"), currentUser)
        //     users = await getUsers()
        //     localStorage.setItem("users", JSON.stringify(users));
        //   } else {
        //     console.log("User already in database.")
        //     currentUser = users.find(item => item.uid === user.uid);
        //     localStorage.setItem("users", JSON.stringify(users));
        //   }
        //   dispatch(login(currentUser))
        // }
      })
  }

  // Sign out
  const signout = () => {
    signOut(auth)
      .then(() => {
        dispatch(logout())
      })
  }

  return (
    <Router>
      <div className="App">
        <>
          <Navbar signin={signin} setTerm={setTerm} userLoading={userLoading}/>
            <main>
              <Routes>
                <Route path='/' element={(
                  <VideoList
                    setVideosByUser={setVideosByUser}
                    term={term}
                  />
                )} />
                <Route path='/videos' element={
                  <VideoPage />
                } />
                <Route path='/likedvideos'
                  element={<LikedVideos />} 
                />
                <Route path='/subscriptions'
                  element={<Subscriptions />}
                />
                <Route path='/users/:uid'
                  element={<UserPage />}
                />
              </Routes>
              <Sidebar />
            </main>
            {
              user && (
                <div className="modal">
                  <div className="modal__user">
                    <figure className="modal__profile">
                      <img src={user && user.photoURL} alt="Profile" />
                    </figure>
                    <h2>{user && user.displayName}</h2>
                  </div>
                  <div className="modal__buttons">
                    <button className="signout" onClick={signout}>
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      Logout
                    </button>
                  </div>
                </div>    
              )
            }
            
          <VideoForm
            videosByUser={videosByUser}
          />
        </>
      </div>
    </Router>
  );
}

export default App;
