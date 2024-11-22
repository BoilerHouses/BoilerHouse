import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const LandingPage = () => {
  const words = ["Club", "Community", "House", "Place"];
  const [currentWord, setCurrentWord] = useState(words[0]);

  const [clubNames, setClubNames] = useState([]);

  const [isLoadingClubs, setIsLoadingClubs] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      setClubNames([]);
      setIsLoadingClubs(true);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/clubs/examples/"
      );
      const clubs = response.data.clubs;

      if (clubs.length > 0) {
        clubs.forEach((club) => {
          if (!clubNames.includes(club.name)) {
            setClubNames((prev) => [...prev, club.name]);
          }
        });
      } else {
        setClubNames(["No Clubs Found"]);
      }

      setIsLoadingClubs(false);
    };
    fetchClubs();

    const interval = setInterval(() => {
      setCurrentWord((prevWord) => {
        const currentIndex = words.indexOf(prevWord);
        const nextIndex = (currentIndex + 1) % words.length;
        return words[nextIndex];
      });
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-9xl font-bold mb-8">Find your</h1>
        <motion.h2
          className="text-9xl font-bold mb-8"
          key={currentWord}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-yellow-500">{currentWord}</span>
          <span>.</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
              Example Clubs
            </h2>
            <ul className="list-disc list-inside text-white">
              {isLoadingClubs
                ? "Loading..."
                : clubNames.map((club, index) => {
                    return <li key={index}>{club}</li>;
                  })}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center"></div>
      </div>
    </div>
  );
};

export default LandingPage;
