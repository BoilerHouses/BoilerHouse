import { useState, useEffect} from 'react';
import LoadingSpinner from './loadingSpinner.jsx'
import axios from 'axios';

function SendEmail() {
    const [selectedClub, setSelectedClub] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs]  = useState([]);
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        // first check if user is logged in
        const token = localStorage.getItem('token')
        if (token){
            setLoading(true)
            axios.get('http://127.0.0.1:8000/api/get_clubs_for_officer/', {
                headers:{
                    'Authorization':token
                }
            })
                .then(response => {
                    setClubs(response.data)
                    setLoading(false)
                })
                .catch(err => {
                    // do error handling later
                    if (err.code === "ERR_NETWORK"){
                        setErrorMessage('Internal Server Error. Please try again.')
                    }
                    else {
                        setErrorMessage("You are not authorized to view this page.  Make sure you are logged in and have the right permissions.")
                    }
                    setLoading(false)
                })
        }
    }, [])








    const handleSend = () => {
        // Implement email sending logic here
    };
    if (loading){
        return LoadingSpinner()
    }
    else {
        if (errorMessage === ''){
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-3xl font-bold mb-4">Send Email to Club Members</h1>
                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Select Club:</label>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="w-full border rounded-md p-2"
                        >
                            <option value="">Select a club</option>
                            {clubs.map((club) => (
                                <option key={club} value={club}>
                                    {club}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Subject:</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Enter subject"
                        />
                    </div>
                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Message:</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded-md p-2 h-32"
                            placeholder="Enter message"
                        ></textarea>
                    </div>
                    <button
                        onClick={handleSend}
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                        Send
                    </button>
                </div>
            );
        }
        else {
            return (
                <div className="h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-red-600 text-white text-2xl p-10 rounded-lg text-center">
                        {errorMessage}
                    </div>
                </div>
            )
        }
    }


}

export default SendEmail;