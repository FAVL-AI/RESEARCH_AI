import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";

export const useSwarmState = () => {
    const { addLog, setGraphData, clearLogs } = useStore();
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let isMounted = true;
        let timeoutPath: NodeJS.Timeout;

        const connect = () => {
            if (!isMounted) return;
            console.log("[WebSocket] Connecting to Swarm Infrastructure...");
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                    case "sync":
                        if (message.data.logs) message.data.logs.forEach((log: any) => addLog(log));
                        if (message.data.graph) setGraphData(message.data.graph);
                        break;
                    case "log":
                    case "agent_log":
                        addLog(message.type === "agent_log" ? message : message.data);
                        break;
                    case "graph_update":
                        setGraphData(message.data);
                        break;
                    case "supervisor_action":
                        addLog({
                            message: `Supervisor decision recorded: ${message.decision}`,
                            status: "warning",
                            timestamp: new Date().toISOString()
                        });
                        break;
                    case "reset":
                        clearLogs();
                        setGraphData({ nodes: [], links: [] });
                        break;
                    default:
                        console.warn("[WebSocket] Unknown message type:", message.type);
                }
            };

            ws.onclose = () => {
                if (!isMounted) return;
                console.log("[WebSocket] Disconnected. Reconnecting in 3s...");
                timeoutPath = setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                // The onclose hook handles reconnection, just close here
                ws.close();
            };
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(timeoutPath);
            if (wsRef.current) {
                // Nullify onclose hook immediately so explicit close doesn't trigger a reconnect timeout
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [addLog, setGraphData, clearLogs]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN
    };
};
