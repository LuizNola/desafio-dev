import { BrowserRouter, Route, Routes } from "react-router-dom"
import React, { Suspense } from "react"
import { SideBarMenu } from "../components/sideBarMenu"
import { Transactions } from "../Containers/transactions"
import { DataImport } from "../Containers/dataimport"


export const Router = () => {
    return (
        
        <Routes>
          <Route path="/dashboard/transactions" element={<SideBarMenu children={<Transactions/>} />}/>
          <Route path="/dashboard/dataimport" element={<SideBarMenu children={<DataImport/>}/>}/>
        
        </Routes>

    )
}