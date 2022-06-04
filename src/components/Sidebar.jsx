import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { selectUser } from "../slices/userSlice"
import "./Sidebar.css"
import SidebarOption from "./SidebarOption"

function Sidebar() {
  const user = useSelector(selectUser);
  const closeSidebar = () => {
    document.querySelector('.sidebar').classList.toggle('visible')
  }

  return (
    <div className="sidebar">
      {
        user ? (
          <Link onClick={closeSidebar} to='/likedvideos'>
            <SidebarOption
              icon={<i className="fa-solid fa-thumbs-up"></i>}
              text="Liked Videos"
            />
          </Link>
        ) : (
          <div onClick={() => {toast.info('You must sign in to view liked videos.', {theme: "colored"})}}>
            <SidebarOption
              icon={<i className="fa-solid fa-thumbs-up"></i>}
              text="Liked Videos"
            />
          </div>
        )
      }
      {
        user ? (
          <Link onClick={closeSidebar} to='/subscriptions'>
            <SidebarOption
              icon={<i className="fa-solid fa-rectangle-list"></i>}
              text="Subscriptions"
            />
          </Link>
        ) : (
          <div onClick={() => {toast.info('You must sign in to view subscriptions.', {theme: "colored"})}}>
            <SidebarOption
              icon={<i className="fa-solid fa-rectangle-list"></i>}
              text="Subscriptions"
            />
          </div>
        )
      }
  
   
      <SidebarOption
       icon={<i className="fa-solid fa-compass"></i>}
       text="Explore"
        notallowed
      />
    </div>
  )
}
export default Sidebar