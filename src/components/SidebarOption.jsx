import { toast } from "react-toastify"
import "./SidebarOption.css"

function SidebarOption({ icon, text, notallowed }) {
  const handleClick = () => {
    if(notallowed) {
      toast.info('Sorry, this feature is not available yet.', {theme: "colored"})
    }
  }

  return (
    <div className="sidebar-option" onClick={handleClick} style={{
      cursor: `${notallowed ? 'not-allowed' : 'pointer'}`,
      opacity: `${notallowed && 0.5}`
    }}>
      {icon}
      <p>{text}</p>
    </div>
  )
}
export default SidebarOption