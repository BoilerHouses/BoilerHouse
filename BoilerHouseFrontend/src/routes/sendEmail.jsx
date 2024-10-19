import { useState, useEffect} from 'react';
import UnauthorizedMessage from './unauthorizedMessage.jsx'

function SendEmail() {
    const [selectedClub, setSelectedClub] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [authorized, setAuthorized] = useState(true);
    const [loading, setLoading] = useState(false);
    const [clubs, setClubs]  = useState([]);

    useEffect(() => {
        // first check if user is logged in
        const token = localStorage.getItem('token')

    }, [])








    const handleSend = () => {
        // Implement email sending logic here
    };


    if (authorized){
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
        return UnauthorizedMessage()
    }

}

export default SendEmail;