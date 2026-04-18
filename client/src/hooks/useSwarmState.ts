import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws";

export const useSwarmState = () => {
    const { addLog, setGraphData, clearLogs } = useStore();
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            console.log("[WebSocket] Connecting to Swarm Infrastructure...");
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                    case "sync":
                        // Initial hydration of logs and graph
                        if (message.data.logs) {
                            message.data.logs.forEach((log: any) => addLog(log));
                        }
                        if (message.data.graph) {
                            setGraphData(message.data.graph);
                        }
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
                console.log("[WebSocket] Disconnected. Reconnecting in 3s...");
                setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error("[WebSocket] Error:", err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [addLog, setGraphData, clearLogs]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN
    };
};
