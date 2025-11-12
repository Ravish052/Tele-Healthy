import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from "axios"

const StreamContext = createContext()

export const streamProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/stream/get-token`,
                    { withCredentials: true }
                )

                if (res.data?.user && res.data?.token) {
                    setUser(res.data.user)
                    setToken(res.data.token)

                    console.log("Stream token fetched successfully", res.data)
                } else {
                    console.error("Invalid response structure", res.data)
                }
            } catch (error) {
                console.error("Error fetching stream token", error)
            }
        }

        fetchToken()
    }, [])

    const logout = async () => {
        try {
            await axios.post(
                `${API_URL}/users/logout`, {},
                { withCredentials: true }
            )

            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            localStorage.removeItem('streamToken')

            setUser(null)
            setToken(null)
        } catch (error) {
            console.error("Error during logout", error)
        }
    }

    return (
        <StreamContext.Provider value={{ user, token, Logout: logout }}>
            {children}
        </StreamContext.Provider>
    )
}

export const useStream = () => useContext(StreamContext);