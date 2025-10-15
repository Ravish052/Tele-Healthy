import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// import {setAuthuser, setPendingEmail} from "../../../store/authSlice"}


const API_url = import.meta.env.VITE_API_URL;

function NewUser() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loadng, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    const handleChange = async (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const submitHandler = async (e) => {
        e.prevetDefault();
        setLoading(true)

        try {
            const response = await axios.post(`${API_URL}/users/signup`, formData, {
                withCredentials: true
            })
        } catch (error) {
            alert(error.response?.data?.message || 'SignUp Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-white text-black flex flex-col justify-center px-6 py-12">
                <div className="flex justify-start mb-8">
                    <Link to="/">
                        <img
                            src="/Images/AskDoc_logo.png"
                            alt="Ask Doc logo"
                            className="h-20 w-auto"
                        />
                    </Link>
                </div>
                <div className="text-left mb-6">
                    <h1 className="text-3xl font-bold mb-2">Welcome to AskDoc</h1>
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                <form
                    className="space-y-5 w-full px-1 sm:px-2"
                    onSubmit={(e) => submitHandler(e)}
                >
                    {["username", "email", "password", "passwordConfirm"].map(
                        (field, i) => (
                            <div key={i}>
                                <label
                                    htmlFor={field}
                                    className="block text-sm font-medium mb-1 capitalize"
                                >
                                    {field === "passwordConfirm" ? "Confirm Password" : field}
                                </label>
                                <input
                                    id={field}
                                    name={field}
                                    type={field.includes("password") ? "password" : "text"}
                                    placeholder={`Enter ${field === "passwordConfirm" ? "Confirm Password" : field
                                        }`}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-white bg-gray-600"
                                />
                            </div>
                        )
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center bg-blue-600 text-white font-semibold py-2 rounded-md transition ${loading ? "cursor-not-allowed opacity-70" : "hover:bg-blue-700"
                                }`}
                        >
                            {loading ? (
                                <Loader
                                    className="animate-spin mr-2"
                                    size={24}
                                    strokeWidth={2}
                                />
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="w-full md:w-1/2 hidden md:block">
                <img
                    src="/Images/AuthBG/AuthBG1.jpg"
                    alt="Docs Background"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    )
}