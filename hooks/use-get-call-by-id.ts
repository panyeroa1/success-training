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
        const callId = Array.isArray(id) ? id[0] : id;
        const call = streamClient.call("default", callId);
        
        // Use getOrCreate() to fetch/create the call and ensure permissions
        await call.getOrCreate();
        
        setCall(call);
      } catch (error) {
        console.error("Error loading call:", error);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [streamClient, id]);

  return { call, isCallLoading };
};
