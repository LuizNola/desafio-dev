import {  useState } from "react";
import "./style.css"
import { Link } from "react-router-dom";

export const SideBarMenu = ({children}: {children?: React.ReactNode}) => {


  const extractPath = () => {
    const url = window.location.href
    const path= url.split("/").slice(3).join("/");
    console.log("/" + path)
    return path;
  };


    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [activeLink, setActiveLink] = useState(extractPath);

    const handleLinkClick = (link: string) => {
        setActiveLink(link);
      };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };
    
      return (
        <div className="page"> 
            <div className="container">
                <div className={`sidebar ${isMenuOpen ? "" : "closed"}`}>
                <Link
                    to="/dashboard/transactions"
                    className={`menu-item ${activeLink === "/dashboard/transactions" ? "active" : ""}`}
                    onClick={() => handleLinkClick("/dashboard/transactions")}
                >
                    <span className="icon">📊</span>
                    {isMenuOpen && <span className="text">Transações</span>}
                </Link>  
                <Link
                    to="/dashboard/dataimport"
                    className={`menu-item ${activeLink === "/dashboard/dataimport" ? "active" : ""}`}
                    onClick={() => handleLinkClick("/dashboard/dataimport")}
                >
                    <span className="icon">📄</span>
                    {isMenuOpen && <span className="text">Planilhas</span>}
                </Link>
                <Link
                    to="/dashboard/transactions/byshop"
                    className={`menu-item ${activeLink === "/dashboard/transactions/byshop" ? "active" : ""}`}
                    onClick={() => handleLinkClick("/dashboard/transactions/byshop")}
                >
                    <span className="icon">🏪</span>
                    {isMenuOpen && <span className="text">Transações por loja</span>}
                </Link>
                </div>
                <div className={`close-button ${isMenuOpen ? "" : "closeo"}`} onClick={toggleMenu}>
                {isMenuOpen ? "⬅️" : "➡️"}
                </div>
            </div>
            {children}
        </div>
        )
}