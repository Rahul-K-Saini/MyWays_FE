import { User } from 'lucide-react'

function Header() {
  return (
    <header className="border-b bg-background">
      <div className="px-9  mx-auto">
        <nav className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wide">ZEKO AI</h1>
          </div>
          <div>
            <User className="h-6 w-6" />
          </div>
        </nav>
      </div>
    </header>
  )
}
export default Header

