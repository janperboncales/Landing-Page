import { useState, useEffect } from 'react';

// Simplified types for the Lanyard API response
interface LanyardData {
  spotify: {
    song: string;
    artist: string;
  } | null;
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
  };
  activities: {
    name: string;
    details?: string;
    state?: string;
    type: number;
  }[];
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
}

interface LanyardResponse {
  success: boolean;
  data?: LanyardData;
}

export const useLanyard = (userId: string) => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const result: LanyardResponse = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch Lanyard data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for updates to simulate real-time presence
    const interval = setInterval(fetchData, 15000);

    return () => clearInterval(interval);

  }, [userId]);

  return { data, loading };
};
