import { useStreamVideoClient, type Call } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const streamClient = useStreamVideoClient();

  useEffect(() => {
    if (!streamClient) return;

    const loadCall = async () => {
      try {
        // Call getOrCreate() to ensure participants can join
        // This grants the necessary permissions for viewing and joining
        const callId = Array.isArray(id) ? id[0] : id;
        const call = streamClient.call("default", callId);
        await call.getOrCreate();
        setCall(call);
      } catch (error) {
        console.error("Error loading call:", error);
      }

      setIsCallLoading(false);
    };

    loadCall();
  }, [streamClient, id]);

  return { call, isCallLoading };
};
