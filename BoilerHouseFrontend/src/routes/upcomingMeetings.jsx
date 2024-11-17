import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import axios from "axios";

const UpcomingMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/meetings/upcoming/",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setMeetings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching upcoming meetings:", error);
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className="flex items-center justify-center my-14">
      <Card className="w-full max-w-md">
        <CardContent>
          <Typography variant="h5" component="h2" className="mb-4 text-center">
            Upcoming Meetings
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : meetings.length > 0 ? (
            <List>
              {meetings.map((meeting, index) => (
                <div key={meeting.id}>
                  <ListItem>
                    <ListItemText
                      primary={meeting.club_name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textPrimary">
                            {new Date(meeting.date).toLocaleString()}
                          </Typography>
                          <br />
                          {meeting.location}
                        </>
                      }
                    />
                  </ListItem>
                  {index < meetings.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          ) : (
            <Typography>No upcoming meetings found.</Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingMeetings;