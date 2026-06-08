import { logout } from '../api'

export default function Dashboard({ user }) {
  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role}</p>
      <p>This is the application shell for future features.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
