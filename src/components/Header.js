import { useContext } from "react";
import Context from "./Context";

export default function Header() {
  const userData = useContext(Context);
  return (
    <nav className="nav-bar">
      <ul>
        <li>Hello {userData.user}</li>
      </ul>
    </nav>
  );
}
