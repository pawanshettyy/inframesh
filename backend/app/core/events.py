import asyncio
import json
from typing import Set, Dict, Any, Callable
from fastapi import WebSocket

class EventBus:
    """
    Central event bus for real-time WebSocket distribution and internal decoupled event triggers.
    Supports in-memory fan-out and optional Redis pub-sub.
    """
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscribers: Dict[str, list[Callable]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, event_type: str, data: Any):
        """
        Broadcast an event to all connected WebSockets.
        """
        payload = {
            "type": event_type,
            "data": data,
            "timestamp": asyncio.get_event_loop().time()
        }
        message_text = json.dumps(payload, default=str)
        
        # Dispatch to WebSockets
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_text)
            except Exception:
                dead_connections.add(connection)
                
        for dead in dead_connections:
            self.active_connections.discard(dead)
            
        # Dispatch to internal subscribers
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        asyncio.create_task(callback(data))
                    else:
                        callback(data)
                except Exception as e:
                    print(f"Error executing event subscriber for {event_type}: {e}")

    def subscribe(self, event_type: str, callback: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)

event_bus = EventBus()
