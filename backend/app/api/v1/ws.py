from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.core.events import event_bus

router = APIRouter(tags=["WebSocket Real-Time Streaming"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await event_bus.connect(websocket)
    try:
        while True:
            # Keep connection open and accept ping/commands
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        event_bus.disconnect(websocket)
    except Exception:
        event_bus.disconnect(websocket)
