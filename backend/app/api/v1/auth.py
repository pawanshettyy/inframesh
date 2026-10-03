from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    # In production, verify against DB hashed_password. Default credentials for demo:
    if req.email and req.password:
        token = create_access_token(subject=req.email, role="admin")
        return TokenResponse(
            access_token=token,
            user={
                "id": "usr_apple_sre_01",
                "email": req.email,
                "name": "Platform SRE Lead",
                "role": "admin",
                "organization_id": "org_apple_core"
            }
        )
    raise HTTPException(status_code=400, detail="Invalid email or password")

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
