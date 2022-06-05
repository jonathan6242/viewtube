import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { selectUser } from "../slices/userSlice"
import "./Navbar.css"

function Navbar({ signin, setTerm, userLoading, toggleTheme }) {
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const [searchText, setSearchText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();
    // navigate('/')
    setTerm(searchText)
  }

  const toggleModal = () => {
    document.body.classList.toggle('modal--open')
  }
  const toggleForm = () => {
    document.body.classList.toggle('create')
  }

  const toggleSidebar = () => {
    document.querySelector('.sidebar').classList.toggle('visible');
  }
  const toggleNavbarMobile = () => {
    console.log('togglenavbarmobile')
    document.querySelector('.navbar__mobile').classList.toggle('hidden');
  }

  return (
    <div className="navbar">
      <div className="navbar__left">
        <button className="toggle__sidebar">
          <i onClick={toggleSidebar} className="fa-solid fa-bars"></i>
        </button>
        <Link onClick={() => {setSearchText(''); setTerm('')}} to='/'>
          <i className="fa-brands fa-youtube">
          </i>
          <h2 className="navbar__title">ViewTube</h2>
        </Link>
      </div>
      <div className="navbar__middle">
        <form onSubmit={handleSubmit}>
          <div className="navbar__input--container">
            <input
              value={searchText}
              onChange={(e) => {setSearchText(e.target.value)}}
              type="text"
              placeholder="Search"
            />
            <div className="navbar__input--search">
              <i className="fa-solid fa-search"></i>
            </div>
          </div>
        </form>
      </div>
      <div className="navbar__right">
        {
          userLoading && (
            <div className="navbar__skeleton">
              <div className="navbar__skeleton--left"></div>
              <div className="navbar__skeleton--right"></div>
            </div>
          )
        }
        {
          !userLoading && (
            <>
              <button onClick={toggleTheme} className="navbar__toggle">
                {
                  <i className="fa-solid fa-circle-half-stroke"></i>
                }
              </button>
              {
                user ? (
                  <Link to='/createvideo'>
                    <button className="navbar__create">
                      <i className="fa-solid fa-video"></i>
                      <span>Create video</span>
                    </button>
                  </Link>
                ) : (
                  <button className="signin" onClick={signin}>
                    <i className="fa-solid fa-user"></i>
                    <span>Sign in</span> 
                  </button>
                )
              }
              <button onClick={toggleNavbarMobile} className="navbar__input--toggle">
                <i className="fa-solid fa-search"></i>
              </button>
              <figure onClick={toggleModal} className="navbar__profile">
                {
                  user ? (
                    <img src={user?.photoURL} alt="Profile" />
                  ) : (
                    <img src="https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max" alt="Profile" />
                  )
                }
              </figure>
            </>
          )
        }
       
      </div>
      <div className="navbar__mobile hidden">
        <form onSubmit={handleSubmit}>
          <button type="button" onClick={toggleNavbarMobile} className="navbar__mobile--back navbar__input--toggle">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <input
            value={searchText}
            onChange={(e) => {setSearchText(e.target.value)}}
            type="text"
            placeholder="Search"
          />
          <button type="submit" className="navbar__mobile--search navbar__input--toggle">
            <i className="fa-solid fa-search"></i>
          </button>
        </form>
      </div>
    </div>
  )
}
export default Navbar
