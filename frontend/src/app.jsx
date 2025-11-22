import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import LogFood from './pages/LogFood'
import Leaderboards from './pages/Leaderboards'
import Feed from './pages/Feed'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. onboarding WITHOUT layout wrapper */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* 2. every other page WITH layout */}
        <Route path="/dashboard" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} />
        <Route path="/log-food" element={<Layout currentPageName="LogFood"><LogFood /></Layout>} />
        <Route path="/leaderboards" element={<Layout currentPageName="Leaderboards"><Leaderboards /></Layout>} />
        <Route path="/feed" element={<Layout currentPageName="Feed"><Feed /></Layout>} />
        <Route path="/communities" element={<Layout currentPageName="Communities"><Communities /></Layout>} />
        <Route path="/communities/:id" element={<Layout currentPageName="CommunityDetail"><CommunityDetail /></Layout>} />
        <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />

        {/* 3. root → dashboard (Layout will auto-redirect if onboarding not done) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}